// backend/controllers/notificationController.js
const Notification = require('../models/notificationModel');

// @desc    Get logged-in user's notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // Show newest first
      .limit(20); // Limit to 20 notifications

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    // Mark all unread notifications for the user as read
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
};