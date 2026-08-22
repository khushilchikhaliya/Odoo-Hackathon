const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { authenticateToken } = require('../middleware/auth');

router.get('/:tripId', authenticateToken, budgetController.getTripBudget);

module.exports = router;
