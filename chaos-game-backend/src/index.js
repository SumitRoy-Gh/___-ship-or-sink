const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load .env variables
dotenv.config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 60 * 1000,    // 1 minute
  max: 20,                 // max 20 requests per minute per IP
  message: { error: 'Too many requests, slow down!' }
});

app.use('/api/', limiter);

app.use(express.json());                  // Understand JSON data
app.use(express.urlencoded({ extended: true })); // Understand form data

// Debug Logger - logs every request hitting the server
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
const taskRoute    = require('./routes/task');
const verifyRoute  = require('./routes/verify');
const rewardRoute  = require('./routes/reward');
const sessionRoute = require('./routes/session');
const authRoute    = require('./routes/auth');

// Connect Database
const db = require('./database/db');

app.use('/api/task',    taskRoute);
app.use('/api/verify',  verifyRoute);
app.use('/api/reward',  rewardRoute);
app.use('/api/session', sessionRoute);
app.use('/api/auth',    authRoute);

// Global Leaderboard Route
app.get('/api/leaderboard', (req, res) => {
  try {
    const stmt = db.prepare('SELECT name, total_score, tasks_completed FROM users WHERE total_score > 0 ORDER BY total_score DESC LIMIT 10');
    const leaderboard = stmt.all();
    res.json(leaderboard);
  } catch (error) {
    console.error('[Leaderboard Error]:', error.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Chaos Game Backend is running!', status: 'ready' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server.'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
