const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

router.get('/', cityController.getAllCities);
router.get('/popular', cityController.getPopularCities);
router.get('/:id', cityController.getCityById);

module.exports = router;
