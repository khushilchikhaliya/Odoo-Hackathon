const db = require('../config/db');

exports.getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalTrips = db.prepare('SELECT COUNT(*) as count FROM trips').get().count;
    const totalStops = db.prepare('SELECT COUNT(*) as count FROM trip_stops').get().count;
    const totalActivitiesPlanned = db.prepare('SELECT COUNT(*) as count FROM trip_activities').get().count;

    const totalBudgetVol = db.prepare('SELECT SUM(total_budget) as total FROM trips').get().total || 0;

    // Top visited / planned destinations
    const topCities = db.prepare(`
      SELECT c.id, c.name, c.country, c.image_url, COUNT(ts.id) as trip_count
      FROM cities c
      LEFT JOIN trip_stops ts ON c.id = ts.city_id
      GROUP BY c.id
      ORDER BY trip_count DESC
      LIMIT 6
    `).all();

    // Activities by category distribution
    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM trip_activities
      GROUP BY category
      ORDER BY count DESC
    `).all();

    // Trip status breakdown
    const tripStatusStats = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM trips
      GROUP BY status
    `).all();

    // Recent activity logs
    const recentLogs = db.prepare(`
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 15
    `).all();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTrips,
        totalStops,
        totalActivitiesPlanned,
        totalBudgetVol: Math.round(totalBudgetVol),
        topCities,
        categoryStats,
        tripStatusStats,
        recentLogs
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsersList = async (req, res, next) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.travel_style, u.created_at,
        (SELECT COUNT(*) FROM trips WHERE user_id = u.id) as trip_count
      FROM users u
      ORDER BY u.created_at DESC
    `).all();

    res.json({
      success: true,
      users
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleUserAdmin = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const user = db.prepare('SELECT id, role, name FROM users WHERE id = ?').get([targetUserId]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newRole = user.role === 'admin' ? 'user' : 'admin';
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run([newRole, targetUserId]);

    db.prepare('INSERT INTO activity_logs (user_id, action_type, description) VALUES (?, ?, ?)')
      .run([req.user.id, 'ADMIN_ROLE_CHANGE', `Changed ${user.name} role to ${newRole}`]);

    res.json({
      success: true,
      message: `User role updated to ${newRole}`,
      newRole
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;

    if (parseInt(targetUserId) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account from here' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run([targetUserId]);

    res.json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (err) {
    next(err);
  }
};
