const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, travel_style, currency } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get([email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, travel_style, currency, avatar_url)
      VALUES (?, ?, ?, 'user', ?, ?, ?)
    `).run([
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash,
      travel_style || 'Balanced',
      currency || 'USD',
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}`
    ]);

    const newUser = db.prepare('SELECT id, name, email, role, avatar_url, bio, currency, language, travel_style, created_at FROM users WHERE id = ?').get([result.lastInsertRowid]);
    const token = generateToken(newUser);

    db.prepare('INSERT INTO activity_logs (user_id, action_type, description) VALUES (?, ?, ?)')
      .run([newUser.id, 'USER_REGISTER', `New user ${newUser.name} registered.`]);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: newUser
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get([email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { password_hash, ...userProfile } = user;

    db.prepare('INSERT INTO activity_logs (user_id, action_type, description) VALUES (?, ?, ?)')
      .run([user.id, 'USER_LOGIN', `User ${user.name} logged in.`]);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userProfile
    });
  } catch (err) {
    next(err);
  }
};

exports.demoLogin = async (req, res, next) => {
  try {
    const { role } = req.body; // 'user' or 'admin'
    const targetEmail = role === 'admin' ? 'admin@globetrotter.com' : 'demo@globetrotter.com';

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get([targetEmail]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Demo user not seeded' });
    }

    const token = generateToken(user);
    const { password_hash, ...userProfile } = user;

    res.json({
      success: true,
      message: `Signed in as Demo ${user.role === 'admin' ? 'Administrator' : 'Traveler'}`,
      token,
      user: userProfile
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const user = db.prepare('SELECT id, email, name FROM users WHERE email = ?').get([email.toLowerCase().trim()]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    // In a production app, an email would be sent. For demo/hackathon, return success with simulated token.
    res.json({
      success: true,
      message: 'Password reset link sent! (Demo mode: Use your current password or reset in settings)',
      resetToken: 'mock-reset-token-2026'
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
};
