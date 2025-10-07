const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/recommend', aiController.queryVehicleAPI);
router.post('/query', aiController.queryVehicleAPI);

module.exports = router;