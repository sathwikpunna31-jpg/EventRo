const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, admin, authorizeRoles } = require('../middleware/authMiddleware');

// Public route to get all announcements
router.route('/').get(getAnnouncements);

// Allow both Super Admins, College Admins, and Club Coordinators to create announcements
router.route('/').post(protect, authorizeRoles('superAdmin', 'collegeAdmin', 'clubCoordinator'), createAnnouncement);

// Allow both Super Admins, College Admins, and Club Coordinators to delete THEIR announcements
router.route('/:id').delete(protect, authorizeRoles('superAdmin', 'collegeAdmin', 'clubCoordinator'), deleteAnnouncement);

module.exports = router;