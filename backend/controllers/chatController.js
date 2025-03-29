const Message = require('../models/Message');

// Send a message
exports.sendMessage = async (req, res) => {
  const { dealId, receiverId, content } = req.body;

  try {
    const message = await Message.create({
      dealId,
      sender: req.user.id,
      receiver: receiverId,
      content
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error });
  }
};

// Get messages for a specific deal
exports.getMessages = async (req, res) => {
  const { dealId } = req.params;

  try {
    const messages = await Message.find({ dealId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  const { dealId } = req.body;

  try {
    await Message.updateMany({ dealId, receiver: req.user.id }, { isRead: true });
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update messages', error });
  }
};
