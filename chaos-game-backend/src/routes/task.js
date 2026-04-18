const express = require('express');
const router = express.Router();
const { generateTask } = require('../services/hfService');
const db = require('../database/db');

// POST /api/task
// Frontend sends: { difficulty: "easy", sessionId: "..." }
router.post('/', async (req, res) => {
  try {
    const { difficulty = 'easy', sessionId } = req.body || {};
    console.log(`--------------------------------------------------`);
    console.log(`[Task Request] Difficulty: ${difficulty.toUpperCase()}`);
    console.log(`[Task Request] Session: ${sessionId || 'anonymous'}`);

    // Validate difficulty
    const allowed = ['easy', 'medium', 'hard'];
    if (!allowed.includes(difficulty)) {
      return res.status(400).json({ error: 'Difficulty must be easy, medium, or hard' });
    }

    const result = await generateTask(difficulty);
    
    // If sessionId is provided, log the task generation in history
    if (sessionId) {
      try {
        const stmt = db.prepare('INSERT INTO task_history (session_id, task_text, task_label, difficulty, passed, points_earned) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(sessionId, result.task, result.taskLabel, difficulty, 0, 0);
      } catch (dbErr) {
        console.warn('[Task DB Warning]: Failed to log task attempt:', dbErr.message);
        // We continue anyway so the user doesn't get blocked
      }
    }

    res.json({ 
      ...result,
      difficulty 
    });

  } catch (error) {
    console.error('[Task Error]:', error.message);
    res.status(500).json({ error: 'Failed to generate task. Try again.' });
  }
});

module.exports = router;
