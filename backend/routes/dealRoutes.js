const express = require('express');
const { createDeal, getDeals, updateDealStatus } = require('../controllers/dealController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, createDeal); // Buyer creates a deal
router.get('/', authMiddleware, getDeals); // Get deals for logged-in user
router.put('/status', authMiddleware, updateDealStatus); // Seller updates deal status

module.exports = router;
