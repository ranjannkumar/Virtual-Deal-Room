const Deal = require('../models/Deal');

// Create a new deal (Only buyers can create)
exports.createDeal = async (req, res) => {
  const { title, description, price, sellerId } = req.body;

  if (req.user.role !== 'buyer') {
    return res.status(403).json({ message: 'Only buyers can create deals' });
  }

  try {
    const newDeal = await Deal.create({
      buyer: req.user.id,
      seller: sellerId,
      title,
      description,
      price,
      status: 'Pending'
    });

    res.status(201).json(newDeal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create deal', error });
  }
};

// Get deals for the logged-in user
exports.getDeals = async (req, res) => {
  try {
    let deals;
    if (req.user.role === 'buyer') {
      deals = await Deal.find({ buyer: req.user.id }).populate('seller', 'name email');
    } else {
      deals = await Deal.find({ seller: req.user.id }).populate('buyer', 'name email');
    }

    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deals', error });
  }
};

// Update deal status (Only sellers can accept/reject)
exports.updateDealStatus = async (req, res) => {
  const { dealId, status } = req.body;

  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can update deal status' });
  }

  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    if (deal.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own deals' });
    }

    deal.status = status;
    await deal.save();

    res.json({ message: 'Deal status updated successfully', deal });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update deal status', error });
  }
};
