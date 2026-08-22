const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Trip routes
router.get('/', tripController.getAllTrips);
router.get('/:id', tripController.getTripById);
router.post('/', tripController.createTrip);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);
router.post('/:id/duplicate', tripController.duplicateTrip);

// Stop routes
router.post('/:tripId/stops', tripController.addStop);
router.put('/stops/:stopId', tripController.updateStop);
router.delete('/stops/:stopId', tripController.deleteStop);
router.post('/:tripId/stops/reorder', tripController.reorderStops);

// Activity routes
router.post('/activities', tripController.addActivity);
router.put('/activities/:activityId', tripController.updateActivity);
router.delete('/activities/:activityId', tripController.deleteActivity);

module.exports = router;
