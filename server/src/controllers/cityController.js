const db = require('../config/db');

exports.getAllCities = async (req, res, next) => {
  try {
    const { search, region, cost_index, sort } = req.query;

    let query = `
      SELECT c.*,
        (SELECT COUNT(*) FROM city_activities WHERE city_id = c.id) as activity_count
      FROM cities c
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (c.name LIKE ? OR c.country LIKE ? OR c.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (region && region !== 'all') {
      query += ` AND c.region = ?`;
      params.push(region);
    }

    if (cost_index && cost_index !== 'all') {
      query += ` AND c.cost_index = ?`;
      params.push(parseInt(cost_index));
    }

    if (sort === 'cost_asc') {
      query += ` ORDER BY c.avg_daily_cost ASC`;
    } else if (sort === 'cost_desc') {
      query += ` ORDER BY c.avg_daily_cost DESC`;
    } else if (sort === 'name') {
      query += ` ORDER BY c.name ASC`;
    } else {
      query += ` ORDER BY c.popularity_score DESC`;
    }

    const cities = db.prepare(query).all(params);

    res.json({
      success: true,
      count: cities.length,
      cities
    });
  } catch (err) {
    next(err);
  }
};

exports.getCityById = async (req, res, next) => {
  try {
    const cityId = req.params.id;
    const city = db.prepare('SELECT * FROM cities WHERE id = ?').get([cityId]);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    const activities = db.prepare('SELECT * FROM city_activities WHERE city_id = ? ORDER BY rating DESC').all([cityId]);

    res.json({
      success: true,
      city: {
        ...city,
        activities
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getPopularCities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const cities = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM city_activities WHERE city_id = c.id) as activity_count
      FROM cities c
      ORDER BY c.popularity_score DESC
      LIMIT ?
    `).all([limit]);

    res.json({
      success: true,
      cities
    });
  } catch (err) {
    next(err);
  }
};
