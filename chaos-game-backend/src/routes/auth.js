const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'chaos_secret_key';

// 1. Manual Signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user (provide a session_id to satisfy NOT NULL constraint)
        const sessionId = req.body.sessionId || `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        
        const result = db.prepare(`
            INSERT INTO users (name, email, password_hash, session_id)
            VALUES (?, ?, ?, ?)
        `).run(name, email, passwordHash, sessionId);

        const userId = result.lastInsertRowid;
        const token = jwt.sign({ userId, email, name }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ 
            message: 'User created successfully',
            token,
            user: { id: userId, name, email }
        });

    } catch (error) {
        console.error('[Signup Error]:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Manual Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user || !user.password_hash) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url,
                total_score: user.total_score,
                tasks_completed: user.tasks_completed
            }
        });

    } catch (error) {
        console.error('[Login Error]:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Google/Social Sync (Upsert)
router.post('/google-sync', async (req, res) => {
    try {
        const { name, email, googleId, avatarUrl } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({ error: 'Email and Google ID are required' });
        }

        // Check if user exists by email or googleId
        let user = db.prepare('SELECT * FROM users WHERE email = ? OR google_id = ?').get(email, googleId);

        if (user) {
            // Update existing user with google info if missing
            db.prepare(`
                UPDATE users 
                SET google_id = ?, avatar_url = ?, name = COALESCE(name, ?)
                WHERE id = ?
            `).run(googleId, avatarUrl, name, user.id);
            
            // Fetch updated user
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
        } else {
            // Create new user (provide a session_id to satisfy NOT NULL constraint)
            const sessionId = req.body.sessionId || `google_${googleId}`;
            const result = db.prepare(`
                INSERT INTO users (name, email, google_id, avatar_url, session_id)
                VALUES (?, ?, ?, ?, ?)
            `).run(name, email, googleId, avatarUrl, sessionId);
            
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        }

        const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url,
                total_score: user.total_score,
                tasks_completed: user.tasks_completed
            }
        });

    } catch (error) {
        console.error('[Google Sync Error]:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Get User Profile (Protected)
router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = db.prepare('SELECT id, name, email, avatar_url, total_score, tasks_completed FROM users WHERE id = ?').get(decoded.userId);
        
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
