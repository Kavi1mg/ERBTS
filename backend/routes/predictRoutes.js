const express = require('express');
const router = express.Router();
const controller = require('../controllers/predictionController');

router.get('/predict', controller.getPrediction);

module.exports = router;
