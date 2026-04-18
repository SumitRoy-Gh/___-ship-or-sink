const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../database/db');
const { generateJudgment } = require('../services/hfService');

// Load rewards data
const rewardsDataPath = path.join(__dirname, '../data/rewards.json');
const allRewardsArray = JSON.parse(fs.readFileSync(rewardsDataPath, 'utf8'));

// POST /api/reward
router.post('/', async (req, res) => {
  try {
    const { taskText, difficulty, sessionId } = req.body || {};
    // Normalize passed to a boolean (handles both true and "true")
    const passed = req.body.passed === true || req.body.passed === 'true';

    if (!difficulty || !sessionId) {
      return res.status(400).json({ error: 'Difficulty (string) and sessionId are required' });
    }

    console.log(`[Reward] Processing reward for ${difficulty} task. Session: ${sessionId} (Passed: ${passed})`);

    // 1. Calculate points
    let pointsEarned = 0;
    if (passed) {
      if (difficulty === 'easy') pointsEarned = 10;
      else if (difficulty === 'medium') pointsEarned = 25;
      else if (difficulty === 'hard') pointsEarned = 50;
    }

    // 2. Update User Score in DB
    const user = db.prepare('SELECT total_score, tasks_completed FROM users WHERE session_id = ?').get(sessionId);
    if (!user) {
      return res.status(404).json({ error: 'User session not found in database' });
    }

    const newTotalScore = user.total_score + pointsEarned;
    const newTasksCompleted = user.tasks_completed + (passed ? 1 : 0);

    db.prepare('UPDATE users SET total_score = ?, tasks_completed = ? WHERE session_id = ?')
      .run(newTotalScore, newTasksCompleted, sessionId);

    // 3. Log Task Result in History
    db.prepare(`
      INSERT INTO task_history (session_id, task_text, task_label, difficulty, passed, points_earned)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      sessionId, 
      taskText || 'Unknown Task', 
      'N/A', 
      difficulty || 'easy', 
      passed ? 1 : 0, 
      pointsEarned || 0
    );

    // 4. Calculate Unlocked Rewards
    const newlyUnlocked = allRewardsArray.filter(r => r.pointsRequired <= newTotalScore && r.pointsRequired > user.total_score);
    
    // Save newly unlocked rewards to DB
    const insertReward = db.prepare('INSERT OR IGNORE INTO unlocked_rewards (session_id, reward_id) VALUES (?, ?)');
    newlyUnlocked.forEach(r => {
      insertReward.run(sessionId, r.id.toString());
    });

    // Get all unlocked reward IDs from DB for this user
    const dbUnlocked = db.prepare('SELECT reward_id FROM unlocked_rewards WHERE session_id = ?').all(sessionId);
    const unlockedIds = new Set(dbUnlocked.map(row => row.reward_id));

    // AI Judgment
    const judgment = await generateJudgment(taskText || "Unknown Task", passed);

    // Add status to ALL rewards for the response
    const rewardsWithStatus = allRewardsArray.map(r => ({
      ...r,
      unlocked: unlockedIds.has(r.id.toString())
    }));

    console.log(`[Reward] DB Updated. Points: +${pointsEarned}, Total: ${newTotalScore}`);

    res.json({
      passed,
      pointsEarned,
      totalScore: newTotalScore,
      judgment,
      unlockedRewards: rewardsWithStatus.filter(r => r.unlocked),
      allRewards: rewardsWithStatus
    });

  } catch (error) {
    console.error('[Reward Error Full]:', error);
    res.status(500).json({ 
      error: 'Failed to process reward.',
      detail: error.message
    });
  }
});

module.exports = router;
