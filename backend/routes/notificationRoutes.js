// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Get all notifications for a user
router.route('/').get(protect, getMyNotifications);

// Mark all notifications as read
router.route('/read').put(protect, markAsRead);

module.exports = router;