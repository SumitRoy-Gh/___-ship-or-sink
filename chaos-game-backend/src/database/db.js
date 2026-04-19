const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'chaos_game.db');
const db = new Database(dbPath);

console.log('[Database] Connected to SQLite');

// ── TABLES INITIALIZATION ───────────────────────────────────────────

// 1. Users table (Sessions + Auth)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE,
    email TEXT UNIQUE,
    name TEXT,
    password_hash TEXT,
    google_id TEXT UNIQUE,
    avatar_url TEXT,
    total_score INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: Add columns if they don't exist
const addColumn = (table, col, type) => {
  try {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`).run();
  } catch (e) {
    // Column might already exist
  }
};

addColumn('users', 'email', 'TEXT');
addColumn('users', 'password_hash', 'TEXT');
addColumn('users', 'google_id', 'TEXT');
addColumn('users', 'avatar_url', 'TEXT');

// Add unique indexes for email and google_id
try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)'); } catch(e) {}
try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)'); } catch(e) {}

// 2. Task History table
db.exec(`
  CREATE TABLE IF NOT EXISTS task_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    task_text TEXT NOT NULL,
    task_label TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    passed INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES users(session_id)
  )
`);

// 3. Unlocked Rewards table
db.exec(`
  CREATE TABLE IF NOT EXISTS unlocked_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    reward_id TEXT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES users(session_id)
  )
`);

module.exports = db;
