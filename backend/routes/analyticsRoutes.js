const express = require('express');
const { getDealStats, getUserEngagement } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');  // Protect route

const router = express.Router();

router.get('/deals-stats', authMiddleware, getDealStats);
router.get('/user-engagement', authMiddleware, getUserEngagement);

module.exports = router;
