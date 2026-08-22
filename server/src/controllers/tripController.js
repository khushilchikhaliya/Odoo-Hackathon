const db = require('../config/db');
const crypto = require('crypto');

function generateShareToken() {
  return crypto.randomBytes(6).toString('hex');
}

exports.getAllTrips = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, search } = req.query;

    let query = `
      SELECT t.*,
        (SELECT COUNT(*) FROM trip_stops WHERE trip_id = t.id) as stop_count,
        (SELECT COUNT(*) FROM trip_activities WHERE trip_id = t.id) as activity_count,
        (
          COALESCE((SELECT SUM(accommodation_cost + transport_cost) FROM trip_stops WHERE trip_id = t.id), 0) +
          COALESCE((SELECT SUM(estimated_cost) FROM trip_activities WHERE trip_id = t.id), 0)
        ) as total_estimated_cost
      FROM trips t
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (status && status !== 'all') {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY t.start_date ASC`;

    const trips = db.prepare(query).all(params);

    // Attach city summaries to each trip card
    const tripsWithCities = trips.map(trip => {
      const stops = db.prepare(`
        SELECT ts.id, ts.city_id, ts.stop_order, c.name as city_name, c.country, c.image_url
        FROM trip_stops ts
        JOIN cities c ON ts.city_id = c.id
        WHERE ts.trip_id = ?
        ORDER BY ts.stop_order ASC
      `).all([trip.id]);
      return {
        ...trip,
        stops
      };
    });

    res.json({
      success: true,
      count: tripsWithCities.length,
      trips: tripsWithCities
    });
  } catch (err) {
    next(err);
  }
};

exports.getTripById = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const userId = req.user.id;

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get([tripId]);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Check authorization (allow if owner or admin or public)
    if (trip.user_id !== userId && req.user.role !== 'admin' && !trip.is_public) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this trip' });
    }

    // Fetch stops with city details
    const stops = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country, c.region, c.cost_index, c.popularity_score, c.image_url as city_image, c.avg_daily_cost, c.currency as city_currency
      FROM trip_stops ts
      JOIN cities c ON ts.city_id = c.id
      WHERE ts.trip_id = ?
      ORDER BY ts.stop_order ASC
    `).all([tripId]);

    // Fetch activities for each stop
    const stopsWithActivities = stops.map(stop => {
      const activities = db.prepare(`
        SELECT ta.*, ca.name as catalog_name, ca.image_url as catalog_image, ca.category as catalog_category, ca.rating as catalog_rating
        FROM trip_activities ta
        LEFT JOIN city_activities ca ON ta.activity_id = ca.id
        WHERE ta.stop_id = ?
        ORDER BY ta.date ASC, ta.order_index ASC
      `).all([stop.id]);

      // Calculate stop specific total
      const stopAccomCost = stop.accommodation_cost || 0;
      const stopTransportCost = stop.transport_cost || 0;
      const stopActivitiesCost = activities.reduce((sum, a) => sum + (a.estimated_cost || 0), 0);

      return {
        ...stop,
        stop_total_cost: stopAccomCost + stopTransportCost + stopActivitiesCost,
        activities
      };
    });

    // Compute overall trip financial summary
    let totalAccom = 0;
    let totalTransport = 0;
    let totalActivities = 0;

    stopsWithActivities.forEach(s => {
      totalAccom += Number(s.accommodation_cost) || 0;
      totalTransport += Number(s.transport_cost) || 0;
      s.activities.forEach(a => {
        totalActivities += Number(a.estimated_cost) || 0;
      });
    });

    const totalEstimatedCost = totalAccom + totalTransport + totalActivities;

    res.json({
      success: true,
      trip: {
        ...trip,
        stops: stopsWithActivities,
        summary: {
          totalAccom,
          totalTransport,
          totalActivities,
          totalEstimatedCost,
          remainingBudget: trip.total_budget - totalEstimatedCost,
          isOverbudget: totalEstimatedCost > trip.total_budget
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      cover_image,
      start_date,
      end_date,
      total_budget,
      currency,
      travel_style,
      is_public
    } = req.body;

    if (!title || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Please provide trip title, start date, and end date' });
    }

    const shareToken = generateShareToken();
    const defaultCover = cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

    const result = db.prepare(`
      INSERT INTO trips (user_id, title, description, cover_image, start_date, end_date, total_budget, currency, is_public, share_token, status, travel_style)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Upcoming', ?)
    `).run([
      userId,
      title.trim(),
      description || '',
      defaultCover,
      start_date,
      end_date,
      parseFloat(total_budget) || 1000.0,
      currency || 'USD',
      is_public ? 1 : 0,
      shareToken,
      travel_style || 'Balanced'
    ]);

    const newTripId = result.lastInsertRowid;

    // Optional: if initial city stops provided in creation wizard
    if (req.body.stops && Array.isArray(req.body.stops)) {
      req.body.stops.forEach((stop, index) => {
        db.prepare(`
          INSERT INTO trip_stops (trip_id, city_id, stop_order, arrival_date, departure_date, accommodation_name, accommodation_cost, transport_type, transport_cost, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run([
          newTripId,
          stop.city_id,
          index + 1,
          stop.arrival_date || start_date,
          stop.departure_date || end_date,
          stop.accommodation_name || '',
          parseFloat(stop.accommodation_cost) || 0,
          stop.transport_type || 'Flight',
          parseFloat(stop.transport_cost) || 0,
          stop.notes || ''
        ]);
      });
    }

    db.prepare('INSERT INTO activity_logs (user_id, action_type, description) VALUES (?, ?, ?)')
      .run([userId, 'TRIP_CREATED', `Created trip "${title.trim()}"`]);

    const createdTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get([newTripId]);

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip: createdTrip
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTrip = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const userId = req.user.id;

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get([tripId]);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this trip' });
    }

    const {
      title,
      description,
      cover_image,
      start_date,
      end_date,
      total_budget,
      currency,
      is_public,
      status,
      travel_style
    } = req.body;

    db.prepare(`
      UPDATE trips
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          cover_image = COALESCE(?, cover_image),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          total_budget = COALESCE(?, total_budget),
          currency = COALESCE(?, currency),
          is_public = COALESCE(?, is_public),
          status = COALESCE(?, status),
          travel_style = COALESCE(?, travel_style),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run([
      title !== undefined ? title.trim() : null,
      description !== undefined ? description : null,
      cover_image !== undefined ? cover_image : null,
      start_date !== undefined ? start_date : null,
      end_date !== undefined ? end_date : null,
      total_budget !== undefined ? parseFloat(total_budget) : null,
      currency !== undefined ? currency : null,
      is_public !== undefined ? (is_public ? 1 : 0) : null,
      status !== undefined ? status : null,
      travel_style !== undefined ? travel_style : null,
      tripId
    ]);

    const updated = db.prepare('SELECT * FROM trips WHERE id = ?').get([tripId]);

    res.json({
      success: true,
      message: 'Trip updated successfully',
      trip: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTrip = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const userId = req.user.id;

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get([tripId]);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this trip' });
    }

    // Delete child records in order
    db.prepare('DELETE FROM trip_activities WHERE trip_id = ?').run([tripId]);
    db.prepare('DELETE FROM trip_stops WHERE trip_id = ?').run([tripId]);
    db.prepare('DELETE FROM trips WHERE id = ?').run([tripId]);

    db.prepare('INSERT INTO activity_logs (user_id, action_type, description) VALUES (?, ?, ?)')
      .run([userId, 'TRIP_DELETED', `Deleted trip "${trip.title}"`]);

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.duplicateTrip = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const userId = req.user.id;

    const original = db.prepare('SELECT * FROM trips WHERE id = ?').get([tripId]);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Original trip not found' });
    }

    const shareToken = generateShareToken();

    // Create cloned trip
    const clonedTripRes = db.prepare(`
      INSERT INTO trips (user_id, title, description, cover_image, start_date, end_date, total_budget, currency, is_public, share_token, status, travel_style)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'Draft', ?)
    `).run([
      userId,
      `Copy of ${original.title}`,
      original.description,
      original.cover_image,
      original.start_date,
      original.end_date,
      original.total_budget,
      original.currency,
      shareToken,
      original.travel_style
    ]);

    const newTripId = clonedTripRes.lastInsertRowid;

    // Clone stops and activities
    const originalStops = db.prepare('SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY stop_order ASC').all([tripId]);

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
      .run([userId, 'TRIP_CLONED', `Cloned trip "${original.title}" as new trip`]);

    const newTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get([newTripId]);

    res.status(201).json({
      success: true,
      message: 'Trip cloned successfully',
      trip: newTrip
    });
  } catch (err) {
    next(err);
  }
};

// Stop Handlers
exports.addStop = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const {
      city_id,
      arrival_date,
      departure_date,
      accommodation_name,
      accommodation_cost,
      transport_type,
      transport_cost,
      notes
    } = req.body;

    if (!city_id || !arrival_date || !departure_date) {
      return res.status(400).json({ success: false, message: 'City and dates are required' });
    }

    // Determine next stop order
    const maxOrderRes = db.prepare('SELECT MAX(stop_order) as maxOrder FROM trip_stops WHERE trip_id = ?').get([tripId]);
    const nextOrder = (maxOrderRes && maxOrderRes.maxOrder ? maxOrderRes.maxOrder : 0) + 1;

    const result = db.prepare(`
      INSERT INTO trip_stops (trip_id, city_id, stop_order, arrival_date, departure_date, accommodation_name, accommodation_cost, transport_type, transport_cost, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run([
      tripId,
      city_id,
      nextOrder,
      arrival_date,
      departure_date,
      accommodation_name || '',
      parseFloat(accommodation_cost) || 0,
      transport_type || 'Flight',
      parseFloat(transport_cost) || 0,
      notes || ''
    ]);

    const newStop = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country, c.image_url as city_image
      FROM trip_stops ts
      JOIN cities c ON ts.city_id = c.id
      WHERE ts.id = ?
    `).get([result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Stop added successfully',
      stop: { ...newStop, activities: [] }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStop = async (req, res, next) => {
  try {
    const stopId = req.params.stopId;
    const {
      city_id,
      arrival_date,
      departure_date,
      accommodation_name,
      accommodation_cost,
      transport_type,
      transport_cost,
      notes,
      stop_order
    } = req.body;

    db.prepare(`
      UPDATE trip_stops
      SET city_id = COALESCE(?, city_id),
          arrival_date = COALESCE(?, arrival_date),
          departure_date = COALESCE(?, departure_date),
          accommodation_name = COALESCE(?, accommodation_name),
          accommodation_cost = COALESCE(?, accommodation_cost),
          transport_type = COALESCE(?, transport_type),
          transport_cost = COALESCE(?, transport_cost),
          notes = COALESCE(?, notes),
          stop_order = COALESCE(?, stop_order)
      WHERE id = ?
    `).run([
      city_id !== undefined ? city_id : null,
      arrival_date !== undefined ? arrival_date : null,
      departure_date !== undefined ? departure_date : null,
      accommodation_name !== undefined ? accommodation_name : null,
      accommodation_cost !== undefined ? parseFloat(accommodation_cost) : null,
      transport_type !== undefined ? transport_type : null,
      transport_cost !== undefined ? parseFloat(transport_cost) : null,
      notes !== undefined ? notes : null,
      stop_order !== undefined ? stop_order : null,
      stopId
    ]);

    const updated = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country, c.image_url as city_image
      FROM trip_stops ts
      JOIN cities c ON ts.city_id = c.id
      WHERE ts.id = ?
    `).get([stopId]);

    res.json({
      success: true,
      message: 'Stop updated successfully',
      stop: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteStop = async (req, res, next) => {
  try {
    const stopId = req.params.stopId;
    db.prepare('DELETE FROM trip_activities WHERE stop_id = ?').run([stopId]);
    db.prepare('DELETE FROM trip_stops WHERE id = ?').run([stopId]);

    res.json({
      success: true,
      message: 'Stop deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.reorderStops = async (req, res, next) => {
  try {
    const { stopIds } = req.body; // Array of stop IDs in new order
    if (!Array.isArray(stopIds)) {
      return res.status(400).json({ success: false, message: 'stopIds array required' });
    }

    stopIds.forEach((id, index) => {
      db.prepare('UPDATE trip_stops SET stop_order = ? WHERE id = ?').run([index + 1, id]);
    });

    res.json({
      success: true,
      message: 'Stops reordered successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Activity Handlers
exports.addActivity = async (req, res, next) => {
  try {
    const { trip_id, stop_id, activity_id, custom_title, custom_description, category, date, time_slot, estimated_cost, duration_hours, status, notes } = req.body;

    if (!trip_id || !stop_id || !date) {
      return res.status(400).json({ success: false, message: 'Trip, stop, and date are required' });
    }

    let title = custom_title;
    let cost = parseFloat(estimated_cost) || 0;
    let cat = category || 'Sightseeing';
    let duration = parseFloat(duration_hours) || 2;

    if (activity_id) {
      const catalog = db.prepare('SELECT * FROM city_activities WHERE id = ?').get([activity_id]);
      if (catalog) {
        title = title || catalog.name;
        cost = estimated_cost !== undefined ? parseFloat(estimated_cost) : catalog.cost;
        cat = cat || catalog.category;
        duration = duration || catalog.duration_hours;
      }
    }

    const result = db.prepare(`
      INSERT INTO trip_activities (trip_id, stop_id, activity_id, custom_title, custom_description, category, date, time_slot, estimated_cost, duration_hours, status, order_index, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run([
      trip_id,
      stop_id,
      activity_id || null,
      title || 'Untitled Activity',
      custom_description || '',
      cat,
      date,
      time_slot || 'Morning',
      cost,
      duration,
      status || 'planned',
      notes || ''
    ]);

    const newActivity = db.prepare(`
      SELECT ta.*, ca.name as catalog_name, ca.image_url as catalog_image, ca.rating as catalog_rating
      FROM trip_activities ta
      LEFT JOIN city_activities ca ON ta.activity_id = ca.id
      WHERE ta.id = ?
    `).get([result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      activity: newActivity
    });
  } catch (err) {
    next(err);
  }
};

exports.updateActivity = async (req, res, next) => {
  try {
    const activityId = req.params.activityId;
    const { custom_title, custom_description, category, date, time_slot, estimated_cost, duration_hours, status, notes, order_index } = req.body;

    db.prepare(`
      UPDATE trip_activities
      SET custom_title = COALESCE(?, custom_title),
          custom_description = COALESCE(?, custom_description),
          category = COALESCE(?, category),
          date = COALESCE(?, date),
          time_slot = COALESCE(?, time_slot),
          estimated_cost = COALESCE(?, estimated_cost),
          duration_hours = COALESCE(?, duration_hours),
          status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          order_index = COALESCE(?, order_index)
      WHERE id = ?
    `).run([
      custom_title !== undefined ? custom_title : null,
      custom_description !== undefined ? custom_description : null,
      category !== undefined ? category : null,
      date !== undefined ? date : null,
      time_slot !== undefined ? time_slot : null,
      estimated_cost !== undefined ? parseFloat(estimated_cost) : null,
      duration_hours !== undefined ? parseFloat(duration_hours) : null,
      status !== undefined ? status : null,
      notes !== undefined ? notes : null,
      order_index !== undefined ? order_index : null,
      activityId
    ]);

    const updated = db.prepare(`
      SELECT ta.*, ca.name as catalog_name, ca.image_url as catalog_image
      FROM trip_activities ta
      LEFT JOIN city_activities ca ON ta.activity_id = ca.id
      WHERE ta.id = ?
    `).get([activityId]);

    res.json({
      success: true,
      message: 'Activity updated successfully',
      activity: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteActivity = async (req, res, next) => {
  try {
    const activityId = req.params.activityId;
    db.prepare('DELETE FROM trip_activities WHERE id = ?').run([activityId]);

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
