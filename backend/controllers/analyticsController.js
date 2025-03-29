const Deal = require('../models/Deal');
const User = require('../models/User');

// Get statistics for completed vs. pending transactions
const getDealStats = async (req, res) => {
  try {
    const completedDeals = await Deal.countDocuments({ status: 'Completed' });
    const pendingDeals = await Deal.countDocuments({ status: 'Pending' });

    res.json({ completedDeals, pendingDeals });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deal statistics' });
  }
};

// Get user engagement tracking (active users)
const getUserEngagement = async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });

    res.json({ activeUsers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user engagement data' });
  }
};

module.exports = { getDealStats, getUserEngagement };
