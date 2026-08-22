const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const { authenticateToken } = require('../middleware/auth');

// Public route to view trip
router.get('/:token', shareController.getPublicTripByToken);

// Protected route to clone trip into current user's trips
router.post('/:token/clone', authenticateToken, shareController.clonePublicTrip);

module.exports = router;
