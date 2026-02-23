const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');
const User = require('../models/userModel');

// @desc    Get a single registration by its ID
// @route   GET /api/registrations/:id
// @access  Private
const getRegistrationById = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id)
            .populate('event', 'title college date imageUrl') // Get event details
            .populate('user', 'name email'); // Get user details

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Security check: Find the event
        const event = await Event.findById(registration.event._id);
        if (!event) {
             return res.status(404).json({ message: 'Event not found' });
        }

        // Check if logged-in user is the one who this registration belongs to OR the admin who owns the event
        if (registration.user._id.toString() !== req.user._id.toString() && event.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(registration);
    } catch (error) {
        console.error("Error fetching registration:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Update a registration (e.g., mark as attended, won)
// @route   PUT /api/registrations/:id
// @access  Private
const updateRegistration = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('event');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Security check: Only the admin who owns the event can update status
        // We check the event's 'user' field (the owner)
        if (registration.event.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update fields based on what's in the request body
        if (req.body.attended !== undefined) {
            registration.attended = Boolean(req.body.attended);
        }
        if (req.body.didWin !== undefined) {
            registration.didWin = Boolean(req.body.didWin);
        }
        if (req.body.certificationUrl !== undefined) {
            registration.certificationUrl = req.body.certificationUrl;
        }

        const updatedRegistration = await registration.save();
        res.json(updatedRegistration);

    } catch (error) {
        console.error("Error updating registration:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

module.exports = {
    getRegistrationById,
    updateRegistration,
};