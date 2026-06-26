const express = require('express');
const router = express.Router();
const { getStats, getHeatmap } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/analytics/stats
router.get('/stats', getStats);

// GET /api/analytics/heatmap
router.get('/heatmap', getHeatmap);

module.exports = router;