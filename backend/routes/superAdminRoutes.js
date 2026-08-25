const express = require('express');
const router = express.Router();
const { protect, superAdmin } = require('../middleware/authMiddleware');
const {
    getColleges,
    approveCollege,
    suspendCollege,
    getGlobalStats,
    createGlobalAnnouncement
} = require('../controllers/superAdminController');

// All routes are protected and restricted to SuperAdmins
router.use(protect, superAdmin);

router.route('/colleges').get(getColleges);
router.route('/colleges/:id/approve').put(approveCollege);
router.route('/colleges/:id/suspend').put(suspendCollege);
router.route('/stats').get(getGlobalStats);
router.route('/announcement').post(createGlobalAnnouncement);

module.exports = router;
