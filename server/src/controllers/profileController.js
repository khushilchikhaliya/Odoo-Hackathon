const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id, name, email, role, avatar_url, bio, currency, language, travel_style, created_at FROM users WHERE id = ?').get([userId]);

    // Saved destinations
    const savedDestinations = db.prepare(`
      SELECT c.*, usd.created_at as saved_at
      FROM user_saved_destinations usd
      JOIN cities c ON usd.city_id = c.id
      WHERE usd.user_id = ?
      ORDER BY usd.created_at DESC
    `).all([userId]);

    res.json({
      success: true,
      user,
      savedDestinations
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, avatar_url, bio, currency, language, travel_style } = req.body;

    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          avatar_url = COALESCE(?, avatar_url),
          bio = COALESCE(?, bio),
          currency = COALESCE(?, currency),
          language = COALESCE(?, language),
          travel_style = COALESCE(?, travel_style),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run([
      name !== undefined ? name.trim() : null,
      avatar_url !== undefined ? avatar_url.trim() : null,
      bio !== undefined ? bio.trim() : null,
      currency !== undefined ? currency : null,
      language !== undefined ? language : null,
      travel_style !== undefined ? travel_style : null,
      userId
    ]);

    const updated = db.prepare('SELECT id, name, email, role, avatar_url, bio, currency, language, travel_style, created_at FROM users WHERE id = ?').get([userId]);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleSavedDestination = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { city_id } = req.body;

    if (!city_id) {
      return res.status(400).json({ success: false, message: 'city_id is required' });
    }

    const existing = db.prepare('SELECT id FROM user_saved_destinations WHERE user_id = ? AND city_id = ?').get([userId, city_id]);

    if (existing) {
      db.prepare('DELETE FROM user_saved_destinations WHERE id = ?').run([existing.id]);
      return res.json({
        success: true,
        saved: false,
        message: 'Destination removed from saved list'
      });
    } else {
      db.prepare('INSERT INTO user_saved_destinations (user_id, city_id) VALUES (?, ?)').run([userId, city_id]);
      return res.json({
        success: true,
        saved: true,
        message: 'Destination saved to your wishlist!'
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get([userId]);
    const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run([newHash, userId]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    db.prepare('DELETE FROM users WHERE id = ?').run([userId]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
