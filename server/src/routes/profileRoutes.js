const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/save-destination', profileController.toggleSavedDestination);
router.post('/change-password', profileController.changePassword);
router.delete('/delete-account', profileController.deleteAccount);

module.exports = router;
