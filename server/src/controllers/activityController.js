const db = require('../config/db');

exports.getAllActivities = async (req, res, next) => {
  try {
    const { city_id, category, max_cost, search, sort } = req.query;

    let query = `
      SELECT ca.*, c.name as city_name, c.country
      FROM city_activities ca
      JOIN cities c ON ca.city_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (city_id && city_id !== 'all') {
      query += ` AND ca.city_id = ?`;
      params.push(parseInt(city_id));
    }

    if (category && category !== 'all') {
      query += ` AND ca.category = ?`;
      params.push(category);
    }

    if (max_cost) {
      query += ` AND ca.cost <= ?`;
      params.push(parseFloat(max_cost));
    }

    if (search) {
      query += ` AND (ca.name LIKE ? OR ca.description LIKE ? OR c.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (sort === 'cost_asc') {
      query += ` ORDER BY ca.cost ASC`;
    } else if (sort === 'cost_desc') {
      query += ` ORDER BY ca.cost DESC`;
    } else {
      query += ` ORDER BY ca.rating DESC, ca.name ASC`;
    }

    const activities = db.prepare(query).all(params);

    res.json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (err) {
    next(err);
  }
};

exports.getActivityById = async (req, res, next) => {
  try {
    const activityId = req.params.id;
    const activity = db.prepare(`
      SELECT ca.*, c.name as city_name, c.country
      FROM city_activities ca
      JOIN cities c ON ca.city_id = c.id
      WHERE ca.id = ?
    `).get([activityId]);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.json({
      success: true,
      activity
    });
  } catch (err) {
    next(err);
  }
};
