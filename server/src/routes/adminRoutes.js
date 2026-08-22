const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

router.use(authenticateToken, requireAdmin);

router.get('/stats', adminController.getPlatformStats);
router.get('/users', adminController.getUsersList);
router.post('/users/:userId/toggle-role', adminController.toggleUserAdmin);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
