const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

// POST /api/session/start
router.post('/start', (req, res) => {
  const sessionId = uuidv4();
  
  try {
    const stmt = db.prepare('INSERT INTO users (session_id) VALUES (?)');
    stmt.run(sessionId);

    console.log(`[Session] Started & Persistent: ${sessionId}`);
    res.json({
      sessionId,
      score: 0,
      tasksCompleted: 0
    });
  } catch (error) {
    console.error('[Session Start Error]:', error.message);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// GET /api/session/leaderboard
// Returns top 10 users by total_score
router.get('/leaderboard', (req, res) => {
  try {
    const stmt = db.prepare('SELECT session_id, name, total_score, tasks_completed FROM users ORDER BY total_score DESC LIMIT 10');
    const leaderboard = stmt.all();
    res.json(leaderboard);
  } catch (error) {
    console.error('[Leaderboard Error]:', error.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/session/:sessionId
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const stmt = db.prepare('SELECT session_id, total_score as score, tasks_completed FROM users WHERE session_id = ?');
    const user = stmt.get(sessionId);

    if (!user) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('[Session Get Error]:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/session/:sessionId/update
router.post('/:sessionId/update', (req, res) => {
  const { sessionId } = req.params;
  const { score, tasksCompleted, name } = req.body;
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE session_id = ?').get(sessionId);
    if (!user) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updates = [];
    const params = [];

    if (score !== undefined) {
      updates.push('total_score = ?');
      params.push(score);
    }
    if (tasksCompleted !== undefined) {
      updates.push('tasks_completed = ?');
      params.push(tasksCompleted);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (updates.length > 0) {
      params.push(sessionId);
      const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE session_id = ?`);
      stmt.run(...params);
    }

    const updatedUser = db.prepare('SELECT session_id, total_score as score, tasks_completed, name FROM users WHERE session_id = ?').get(sessionId);
    res.json(updatedUser);

  } catch (error) {
    console.error('[Session Update Error]:', error.message);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// GET /api/session/:sessionId/stats
// Returns aggregated stats for the dashboard
router.get('/:sessionId/stats', (req, res) => {
  const { sessionId } = req.params;

  try {
    // 1. Category Breakdown
    const categoryStmt = db.prepare(`
      SELECT task_label as name, COUNT(*) as total, SUM(passed) as completed
      FROM task_history
      WHERE session_id = ?
      GROUP BY task_label
    `);
    const categories = categoryStmt.all(sessionId);

    // 2. Point History (for sparkline)
    const historyStmt = db.prepare(`
      SELECT points_earned, created_at
      FROM task_history
      WHERE session_id = ?
      ORDER BY created_at ASC
      LIMIT 20
    `);
    const history = historyStmt.all(sessionId);

    // 3. Overall Stats
    const user = db.prepare('SELECT total_score, tasks_completed FROM users WHERE session_id = ?').get(sessionId);

    res.json({
      score: user?.total_score || 0,
      tasksCompleted: user?.tasks_completed || 0,
      categories: categories.map(c => ({
        name: c.name,
        completed: c.completed,
        total: c.total,
        color: ['#ff4d00', '#ff00aa', '#bf5fff', '#00e5ff', '#39ff14', '#ffd60a'][Math.floor(Math.random() * 6)]
      })),
      history: history.map(h => h.points_earned),
      recentActivity: history.slice(-5).reverse().map(h => ({
        type: h.points_earned > 0 ? 'approved' : 'rejected',
        text: 'Task Attempt',
        points: h.points_earned,
        time: 'recent'
      }))
    });

  } catch (error) {
    console.error('[Stats Error]:', error.message);
    res.status(500).json({ error: 'Failed to fetch session stats' });
  }
});

module.exports = router;
