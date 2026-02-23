const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMyRegistrations,
    getUserProfile,
    uploadProfilePicture,
    updateUserProfile,
    updateUserPassword,
    getMyReviews,
    getMyQuestions,
    saveEvent,
    unsaveEvent,
    getSavedEvents,
    getMyFullRegistrations,
    createStudent,
    getStudents,
    deleteStudent,
    bulkCreateStudents
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/myregistrations', protect, getMyRegistrations);
router.get('/myregistrations/all', protect, getMyFullRegistrations);

router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/profile/photo', protect, upload.single('profileImage'), uploadProfilePicture);
router.put('/profile/password', protect, updateUserPassword);

router.get('/myreviews', protect, getMyReviews);
router.get('/myquestions', protect, getMyQuestions);

// Routes for saving/unsaving events
router.route('/save/:eventId')
    .post(protect, saveEvent)
    .delete(protect, unsaveEvent);

// Route for getting saved events
router.get('/savedevents', protect, getSavedEvents);

// Route for creating student (Admin only)
router.post('/create-student', protect, createStudent);

// Student Management Routes
router.get('/students', protect, getStudents);
router.delete('/students/:id', protect, deleteStudent);
router.post('/students/bulk', protect, bulkCreateStudents);

module.exports = router;