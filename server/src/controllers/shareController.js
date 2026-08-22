const db = require('../config/db');
const crypto = require('crypto');

function generateShareToken() {
  return crypto.randomBytes(6).toString('hex');
}

exports.getPublicTripByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const trip = db.prepare(`
      SELECT t.*, u.name as author_name, u.avatar_url as author_avatar
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.share_token = ?
    `).get([token]);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Shared itinerary not found or has expired' });
    }

    // Fetch stops
    const stops = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country, c.region, c.cost_index, c.image_url as city_image
      FROM trip_stops ts
      JOIN cities c ON ts.city_id = c.id
      WHERE ts.trip_id = ?
      ORDER BY ts.stop_order ASC
    `).all([trip.id]);

    // Fetch activities
    const stopsWithActivities = stops.map(stop => {
      const activities = db.prepare(`
        SELECT ta.*, ca.name as catalog_name, ca.image_url as catalog_image, ca.category as catalog_category, ca.rating as catalog_rating
        FROM trip_activities ta
        LEFT JOIN city_activities ca ON ta.activity_id = ca.id
        WHERE ta.stop_id = ?
        ORDER BY ta.date ASC, ta.order_index ASC
      `).all([stop.id]);

      return {
        ...stop,
        activities
      };
    });

    // Compute basic totals
    let totalEstimatedCost = 0;
    stopsWithActivities.forEach(s => {
      totalEstimatedCost += (Number(s.accommodation_cost) || 0) + (Number(s.transport_cost) || 0);
      s.activities.forEach(a => {
        totalEstimatedCost += Number(a.estimated_cost) || 0;
      });
    });

    res.json({
      success: true,
      trip: {
        ...trip,
        total_estimated_cost: totalEstimatedCost,
        stops: stopsWithActivities
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.clonePublicTrip = async (req, res, next) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    const original = db.prepare('SELECT * FROM trips WHERE share_token = ?').get([token]);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const newShareToken = generateShareToken();

    const clonedRes = db.prepare(`
      INSERT INTO trips (user_id, title, description, cover_image, start_date, end_date, total_budget, currency, is_public, share_token, status, travel_style)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'Upcoming', ?)
    `).run([
      userId,
      `Cloned: ${original.title}`,
      original.description,
      original.cover_image,
      original.start_date,
      original.end_date,
      original.total_budget,
      original.currency,
      newShareToken,
      original.travel_style
    ]);

    const newTripId = clonedRes.lastInsertRowid;

    const originalStops = db.prepare('SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY stop_order ASC').all([original.id]);

    for (const stop of originalStops) {
      const clonedStopRes = db.prepare(`
        INSERT INTO trip_stops (trip_id, city_id, stop_order, arrival_date, departure_date, accommodation_name, accommodation_cost, transport_type, transport_cost, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        newTripId,
        stop.city_id,
        stop.stop_order,
        stop.arrival_date,
        stop.departure_date,
        stop.accommodation_name,
        stop.accommodation_cost,
        stop.transport_type,
        stop.transport_cost,
        stop.notes
      ]);

      const newStopId = clonedStopRes.lastInsertRowid;

      const stopActivities = db.prepare('SELECT * FROM trip_activities WHERE stop_id = ?').all([stop.id]);
      for (const act of stopActivities) {
        db.prepare(`
          INSERT INTO trip_activities (trip_id, stop_id, activity_id, custom_title, custom_description, category, date, time_slot, estimated_cost, duration_hours, status, order_index, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?, ?)
        `).run([
          newTripId,
          newStopId,
          act.activity_id,
          act.custom_title,
          act.custom_description,
          act.category,
          act.date,
          act.time_slot,
          act.estimated_cost,
          act.duration_hours,
          act.order_index,
          act.notes
        ]);
      }
    }

    db.prepare('INSERT INTO activity_logs (user_id, action_type, description) VALUES (?, ?, ?)')
      .run([userId, 'TRIP_CLONED', `Cloned shared trip "${original.title}" into own account.`]);

    const createdTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get([newTripId]);

    res.status(201).json({
      success: true,
      message: 'Trip added to your account successfully!',
      trip: createdTrip
    });
  } catch (err) {
    next(err);
  }
};
