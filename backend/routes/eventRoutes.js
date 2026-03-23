const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
  getMyEvents,
  deleteEvent,
  updateEvent,
  createEventReview,
  askQuestion,
  answerQuestion,
  cancelRegistration,
  getEventRegistrations,
  toggleAttendance,
  getPopularEvents,
  downloadRegistrations,
  checkRegistration
} = require('../controllers/eventController');
const { protect, admin, coordinatorOrAdmin } = require('../middleware/authMiddleware');

// Route to get all events AND create an event
router.route('/').get(getEvents).post(protect, coordinatorOrAdmin, createEvent);

// Route for admin's events
router.route('/myevents').get(protect, coordinatorOrAdmin, getMyEvents);

// GET /api/events/popular (MUST be before /:id)
router.get('/popular', getPopularEvents);

// Routes for a specific event by ID
router
  .route('/:id')
  .get(getEventById)
  .delete(protect, coordinatorOrAdmin, deleteEvent)
  .put(protect, coordinatorOrAdmin, updateEvent);

// Route for event registration
router
  .route('/:id/register')
  .post(protect, registerForEvent)
  .delete(protect, cancelRegistration);

// Route for event reviews
router.route('/:id/reviews').post(protect, createEventReview);

// Routes for event Q&A
router.route('/:id/questions').post(protect, askQuestion);
router.route('/:id/questions/:questionId').put(protect, coordinatorOrAdmin, answerQuestion);

// Route for viewing event registrations
router.route('/:id/registrations').get(protect, coordinatorOrAdmin, getEventRegistrations);

// Route for toggling attendance
router.route('/:id/attendance/:registrationId').put(protect, coordinatorOrAdmin, toggleAttendance);

// Route for downloading event registrations
router.route('/:id/registrations/download').get(protect, coordinatorOrAdmin, downloadRegistrations);

// Route to check if user is registered
router.route('/:id/isregistered').get(protect, checkRegistration); // <-- Now it's defined

// GET /api/events/analytics/college
router.get('/analytics/college', protect, coordinatorOrAdmin, require('../controllers/eventController').getCollegeAnalytics);

module.exports = router;