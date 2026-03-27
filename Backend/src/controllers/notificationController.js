const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.status(200).json({ data: notifications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, recipient: req.userId },
      { isRead: true }
    );
    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notification' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notifications' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
