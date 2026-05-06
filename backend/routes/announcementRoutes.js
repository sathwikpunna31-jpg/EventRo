const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to get all announcements
router.route('/').get(getAnnouncements);

// Admin route to create an announcement
router.route('/').post(protect, admin, createAnnouncement);

// Admin route to delete an announcement
router.route('/:id').delete(protect, admin, deleteAnnouncement);

module.exports = router;