const db = require('../config/db');

exports.getTripBudget = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const userId = req.user ? req.user.id : null;

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get([tripId]);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (userId && trip.user_id !== userId && req.user.role !== 'admin' && !trip.is_public) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Fetch stops
    const stops = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country
      FROM trip_stops ts
      JOIN cities c ON ts.city_id = c.id
      WHERE ts.trip_id = ?
      ORDER BY ts.stop_order ASC
    `).all([tripId]);

    // 2. Fetch activities
    const activities = db.prepare(`
      SELECT ta.*, ts.stop_order, c.name as city_name
      FROM trip_activities ta
      JOIN trip_stops ts ON ta.stop_id = ts.id
      JOIN cities c ON ts.city_id = c.id
      WHERE ta.trip_id = ?
      ORDER BY ta.date ASC
    `).all([tripId]);

    // Compute Category Breakdowns
    let transportCost = 0;
    let accommodationCost = 0;
    let sightseeingCost = 0;
    let foodDiningCost = 0;
    let adventureCost = 0;
    let cultureCost = 0;
    let nightlifeCost = 0;
    let otherActivitiesCost = 0;

    stops.forEach(stop => {
      transportCost += Number(stop.transport_cost) || 0;
      accommodationCost += Number(stop.accommodation_cost) || 0;
    });

    const dayExpenseMap = {};

    activities.forEach(act => {
      const cost = Number(act.estimated_cost) || 0;
      const cat = (act.category || '').toLowerCase();

      if (cat.includes('sightseeing')) sightseeingCost += cost;
      else if (cat.includes('food') || cat.includes('dining')) foodDiningCost += cost;
      else if (cat.includes('adventure')) adventureCost += cost;
      else if (cat.includes('culture')) cultureCost += cost;
      else if (cat.includes('nightlife')) nightlifeCost += cost;
      else otherActivitiesCost += cost;

      // Group activities by date
      if (act.date) {
        dayExpenseMap[act.date] = (dayExpenseMap[act.date] || 0) + cost;
      }
    });

    // Distribute accommodation and transport to dates if available
    stops.forEach(stop => {
      if (stop.arrival_date) {
        dayExpenseMap[stop.arrival_date] = (dayExpenseMap[stop.arrival_date] || 0) + (Number(stop.transport_cost) || 0);
      }
      if (stop.arrival_date) {
        dayExpenseMap[stop.arrival_date] = (dayExpenseMap[stop.arrival_date] || 0) + (Number(stop.accommodation_cost) || 0);
      }
    });

    const totalActivities = sightseeingCost + foodDiningCost + adventureCost + cultureCost + nightlifeCost + otherActivitiesCost;
    const totalSpent = transportCost + accommodationCost + totalActivities;

    // Calculate Trip Duration Days
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const diffTime = Math.abs(endDate - startDate);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const averageCostPerDay = totalSpent > 0 ? (totalSpent / totalDays) : 0;
    const averageDailyBudget = trip.total_budget / totalDays;

    // Build Day-by-Day Timeline Array
    const dayBreakdown = [];
    const alerts = [];

    // Generate dates between start and end
    const curr = new Date(startDate);
    let dayIndex = 1;
    while (curr <= endDate) {
      const dateStr = curr.toISOString().split('T')[0];
      const spentOnDay = dayExpenseMap[dateStr] || 0;

      const isOver = spentOnDay > (averageDailyBudget * 1.35) && spentOnDay > 100;
      if (isOver) {
        alerts.push({
          date: dateStr,
          dayNumber: dayIndex,
          amount: spentOnDay,
          limit: averageDailyBudget.toFixed(2),
          message: `Day ${dayIndex} (${dateStr}) exceeds your daily average target by ${(spentOnDay - averageDailyBudget).toFixed(2)} ${trip.currency}`
        });
      }

      dayBreakdown.push({
        dayNumber: dayIndex,
        date: dateStr,
        cost: spentOnDay,
        isOverbudget: isOver
      });

      curr.setDate(curr.getDate() + 1);
      dayIndex++;
    }

    if (totalSpent > trip.total_budget) {
      alerts.unshift({
        date: 'Total',
        dayNumber: 0,
        amount: totalSpent,
        limit: trip.total_budget,
        message: `Trip is currently over budget by ${(totalSpent - trip.total_budget).toFixed(2)} ${trip.currency}!`
      });
    }

    res.json({
      success: true,
      budget: {
        tripId: trip.id,
        tripTitle: trip.title,
        currency: trip.currency,
        totalBudget: trip.total_budget,
        totalEstimatedCost: totalSpent,
        remainingBudget: trip.total_budget - totalSpent,
        percentageUsed: trip.total_budget > 0 ? Math.min(100, Math.round((totalSpent / trip.total_budget) * 100)) : 0,
        isOverbudget: totalSpent > trip.total_budget,
        totalDays,
        averageCostPerDay: parseFloat(averageCostPerDay.toFixed(2)),
        averageDailyBudget: parseFloat(averageDailyBudget.toFixed(2)),
        categories: [
          { name: 'Accommodation', amount: accommodationCost, color: '#3B82F6' },
          { name: 'Transport', amount: transportCost, color: '#10B981' },
          { name: 'Sightseeing & Tours', amount: sightseeingCost, color: '#8B5CF6' },
          { name: 'Food & Dining', amount: foodDiningCost, color: '#F59E0B' },
          { name: 'Adventure & Outdoor', amount: adventureCost, color: '#EF4444' },
          { name: 'Culture & Heritage', amount: cultureCost, color: '#EC4899' },
          { name: 'Nightlife & Drinks', amount: nightlifeCost, color: '#6366F1' },
          { name: 'Miscellaneous', amount: otherActivitiesCost, color: '#6B7280' }
        ],
        dayBreakdown,
        alerts
      }
    });
  } catch (err) {
    next(err);
  }
};
