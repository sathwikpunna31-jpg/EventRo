const express = require('express');
const router = express.Router();
const { getRegistrationById, updateRegistration } = require('../controllers/registrationController');
const { protect, admin } = require('../middleware/authMiddleware'); // Import admin middleware

// GET /api/registrations/:id (for the ticket page - protect for any logged in user)
// PUT /api/registrations/:id (for updating attended/won status - protect for ADMIN only)
router
    .route('/:id')
    .get(protect, getRegistrationById)
    .put(protect, admin, updateRegistration); // <-- Secured with admin middleware

module.exports = router;