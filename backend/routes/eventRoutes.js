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
  getPopularEvents,
  downloadRegistrations,
  checkRegistration // <-- Make sure this is imported here
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route to get all events AND create an event
router.route('/').get(getEvents).post(protect, admin, upload.single('image'), createEvent);

// Route for admin's events
router.route('/myevents').get(protect, admin, getMyEvents);

// GET /api/events/popular (MUST be before /:id)
router.get('/popular', getPopularEvents);

// Routes for a specific event by ID
router
  .route('/:id')
  .get(getEventById)
  .delete(protect, admin, deleteEvent)
  .put(protect, admin, upload.single('image'), updateEvent);

// Route for event registration
router
  .route('/:id/register')
  .post(protect, registerForEvent)
  .delete(protect, cancelRegistration);

// Route for event reviews
router.route('/:id/reviews').post(protect, createEventReview);

// Routes for event Q&A
router.route('/:id/questions').post(protect, askQuestion);
router.route('/:id/questions/:questionId').put(protect, admin, answerQuestion);

// Route for viewing event registrations
router.route('/:id/registrations').get(protect, admin, getEventRegistrations);

// Route for downloading event registrations
router.route('/:id/registrations/download').get(protect, admin, downloadRegistrations);

// Route to check if user is registered
router.route('/:id/isregistered').get(protect, checkRegistration); // <-- Now it's defined

module.exports = router;