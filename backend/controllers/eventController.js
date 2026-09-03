const User = require('../models/userModel');
const Event = require('../models/eventModel');
const Notification = require('../models/notificationModel');
const Registration = require('../models/registrationModel');
const { Parser } = require('json2csv');
const { generateEmbedding } = require('../services/aiService');

// @desc    Create a new event
const createEvent = async (req, res) => {
    console.log("createEvent controller called!");
    console.log("req.body parsed by multer:", req.body);
    console.log("req.file parsed by multer:", req.file);
    const { title, description, college, date, category, isFree, price } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;
    try {
        const event = new Event({
            title,
            description,
            college,
            date,
            category,
            imageUrl,
            user: req.user._id,
            isFree,
            price: isFree ? 0 : price,
            visibility: req.body.visibility || 'private', // Default to private
        });
        const createdEvent = await event.save();

        // Asynchronously generate vector embedding in background
        generateEmbedding(`${title}. Category: ${category}. College: ${college}. Description: ${description}`)
            .then(async (embedding) => {
                if (embedding && embedding.length > 0) {
                    createdEvent.embedding = embedding;
                    await createdEvent.save();
                }
            })
            .catch((err) => console.warn('Background embedding generation failed:', err.message));

        res.status(201).json(createdEvent);
    } catch (error) {
        console.error("Error in createEvent:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Fetch all events
const getEvents = async (req, res) => {
    try {
        const { visibility, college } = req.query;
        let query = {};

        if (visibility === 'public') {
            query.visibility = 'public';
        } else if (college) {
            // If college is provided, return:
            // 1. All PUBLIC events (from any college)
            // 2. PRIVATE events from THIS college
            console.log(`Fetching events for college: '${college}' (Public + Private)`);
            const escapedCollege = college.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            query = {
                $or: [
                    { visibility: 'public' },
                    {
                        college: { $regex: new RegExp(`^\\s*${escapedCollege.trim()}\\s*$`, 'i') },
                        visibility: 'private'
                    }
                ]
            };
            console.log('Query:', JSON.stringify(query));
        } else {
            // Default: Return ONLY public events if no college specified
            query.visibility = 'public';
        }

        const events = await Event.find(query).populate('user', 'name');
        res.json(events);
    } catch (error) {
        console.error("Error in getEvents:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Fetch a single event by ID
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) res.json(event);
        else res.status(404).json({ message: 'Event not found' });
    } catch (error) {
        console.error("Error in getEventById:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Register a user for an event
const registerForEvent = async (req, res) => {
    const { phoneNumber, collegeName, yearOfStudy } = req.body;
    const eventId = req.params.id;
    const userId = req.user._id;

    if (!phoneNumber || !collegeName)
        return res.status(400).json({ message: 'Please provide phone number and college name.' });

    try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const alreadyRegistered = await Registration.findOne({ event: eventId, user: userId });
        if (alreadyRegistered)
            return res.status(400).json({ message: 'You are already registered for this event' });

        const registration = await Registration.create({
            event: eventId,
            user: userId,
            phoneNumber,
            collegeName,
            yearOfStudy,
        });

        // Create notification for admin
        try {
            await Notification.create({
                user: event.user,
                message: `New Registration: ${req.user.name} just registered for your event "${event.title}"!`,
                link: `/event/${event._id}/registrations`,
            });
        } catch (notificationError) {
            console.error("Failed to create registration notification:", notificationError);
        }

        res.status(201).json(registration);
    } catch (error) {
        console.error("Error in registerForEvent:", error);
        if (error.code === 11000)
            return res.status(400).json({ message: 'You are already registered for this event.' });
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get events for the logged-in admin
const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ user: req.user._id }).lean();
        const eventsWithCounts = await Promise.all(
            events.map(async (event) => {
                const registrationCount = await Registration.countDocuments({ event: event._id });
                return { ...event, registrationCount };
            })
        );
        res.json(eventsWithCounts);
    } catch (error) {
        console.error("Error in getMyEvents:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Delete an event
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: 'Not authorized' });

        await Registration.deleteMany({ event: event._id });
        await event.deleteOne();
        res.json({ message: 'Event and associated registrations removed' });
    } catch (error) {
        console.error("Error in deleteEvent:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Update an event
const updateEvent = async (req, res) => {
    const { title, description, college, date, category, isFree, price } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: 'Not authorized' });

        event.title = title || event.title;
        event.description = description || event.description;
        event.college = college || event.college;
        event.date = date || event.date;
        event.category = category || event.category;
        event.imageUrl = imageUrl || event.imageUrl;
        event.isFree = isFree ?? event.isFree;
        event.price = isFree ? 0 : price || event.price;
        event.visibility = req.body.visibility || event.visibility;

        const updatedEvent = await event.save();

        // Asynchronously update vector embedding in background
        generateEmbedding(`${updatedEvent.title}. Category: ${updatedEvent.category}. College: ${updatedEvent.college}. Description: ${updatedEvent.description}`)
            .then(async (embedding) => {
                if (embedding && embedding.length > 0) {
                    updatedEvent.embedding = embedding;
                    await updatedEvent.save();
                }
            })
            .catch((err) => console.warn('Background embedding update failed:', err.message));

        res.json(updatedEvent);
    } catch (error) {
        console.error("Error in updateEvent:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Create a new review
const createEventReview = async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const isRegistered = await Registration.findOne({ event: req.params.id, user: req.user._id });
        if (!isRegistered)
            return res.status(400).json({ message: 'You must be registered to leave a review.' });

        const alreadyReviewed = event.reviews.find(r => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed)
            return res.status(400).json({ message: 'You have already reviewed this event.' });

        const review = { name: req.user.name, rating: Number(rating), comment, user: req.user._id };
        event.reviews.push(review);
        event.numReviews = event.reviews.length;
        event.rating = event.reviews.reduce((acc, item) => item.rating + acc, 0) / event.reviews.length;
        await event.save();

        try {
            await Notification.create({
                user: event.user,
                message: `${req.user.name} left a ${rating}-star review on "${event.title}".`,
                link: `/event/${event._id}`,
            });
        } catch (notificationError) {
            console.error("Failed to create review notification:", notificationError);
        }

        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        console.error("Error in createEventReview:", error);
        res.status(400).json({ message: error.message || 'Failed to add review' });
    }
};

// @desc    Ask a question about an event
const askQuestion = async (req, res) => {
    const { question } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const newQuestion = { question, user: req.user._id, name: req.user.name };
        event.questions.push(newQuestion);
        await event.save();

        try {
            await Notification.create({
                user: event.user,
                message: `${req.user.name} asked a new question on "${event.title}".`,
                link: `/dashboard`,
            });
        } catch (notificationError) {
            console.error("Failed to create question notification:", notificationError);
        }

        res.status(201).json({ message: 'Question submitted' });
    } catch (error) {
        console.error("Error in askQuestion:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Answer a question
const answerQuestion = async (req, res) => {
    const { answer } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: 'Not authorized' });

        const question = event.questions.id(req.params.questionId);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        question.answer = answer;
        await event.save();

        try {
            await Notification.create({
                user: question.user,
                message: `Your question on "${event.title}" has been answered!`,
                link: `/event/${event._id}#qna`,
            });
        } catch (notificationError) {
            console.error("Failed to create notification:", notificationError);
        }

        res.json({ message: 'Answer submitted' });
    } catch (error) {
        console.error("Error in answerQuestion:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Cancel a user's registration for an event
const cancelRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOneAndDelete({
            event: req.params.id,
            user: req.user._id
        });
        if (!registration) return res.status(404).json({ message: 'Registration not found.' });
        res.status(200).json({ message: 'Registration cancelled successfully' });
    } catch (error) {
        console.error("Error in cancelRegistration:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get registrations for a specific event
const getEventRegistrations = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: 'Not authorized' });

        const registrations = await Registration.find({ event: req.params.id })
            .populate('user', 'name email profilePicture');

        const studentList = registrations.map(reg => ({
            _id: reg._id,
            user: reg.user,
            phoneNumber: reg.phoneNumber,
            collegeName: reg.collegeName,
            yearOfStudy: reg.yearOfStudy,
            attended: reg.attended,
            didWin: reg.didWin,
            certificationUrl: reg.certificationUrl,
        }));

        res.json(studentList);
    } catch (error) {
        console.error("Error in getEventRegistrations:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get top popular events
const getPopularEvents = async (req, res) => {
    try {
        // 1. Find all public events
        const publicEvents = await Event.find({ visibility: 'public' }, '_id');
        const publicEventIds = publicEvents.map(e => e._id);

        // 2. Aggregate registrations for these public events
        const popularEventIds = await Registration.aggregate([
            { $match: { event: { $in: publicEventIds } } },
            { $group: { _id: "$event", registrationCount: { $sum: 1 } } },
            { $sort: { registrationCount: -1 } },
            { $limit: 8 }
        ]);

        const registeredIds = popularEventIds.map(e => e._id);

        // 3. Fetch the full event details
        const events = await Event.find({ _id: { $in: registeredIds } });

        // Map registration counts
        let popularEvents = events.map(event => {
            const stats = popularEventIds.find(e => e._id.equals(event._id));
            return { ...event.toObject(), registrationCount: stats?.registrationCount || 0 };
        });

        // Sort by count descending
        popularEvents.sort((a, b) => b.registrationCount - a.registrationCount);

        // 4. Fallback: If we have less than 8 events, fill up with other public events
        if (popularEvents.length < 8) {
            const remainingCount = 8 - popularEvents.length;
            const extraEvents = await Event.find({
                visibility: 'public',
                _id: { $nin: registeredIds }
            }).limit(remainingCount);

            const formattedExtra = extraEvents.map(event => ({
                ...event.toObject(),
                registrationCount: 0
            }));

            popularEvents = [...popularEvents, ...formattedExtra];
        }

        res.json(popularEvents);
    } catch (error) {
        console.error("Error in getPopularEvents:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Download registrations as CSV
const downloadRegistrations = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: 'Not authorized' });

        const registrations = await Registration.find({ event: req.params.id }).populate('user', 'name email');

        const dataForCsv = registrations.map(reg => ({
            name: reg.user?.name || 'N/A',
            email: reg.user?.email || 'N/A',
            phoneNumber: reg.phoneNumber,
            collegeName: reg.collegeName,
            yearOfStudy: reg.yearOfStudy || 'N/A',
            attended: reg.attended ? 'Yes' : 'No',
            won: reg.didWin ? 'Yes' : 'No',
            registeredAt: reg.createdAt,
        }));

        const fields = [
            { label: 'Student Name', value: 'name' },
            { label: 'Email Address', value: 'email' },
            { label: 'Phone Number', value: 'phoneNumber' },
            { label: 'College', value: 'collegeName' },
            { label: 'Year', value: 'yearOfStudy' },
            { label: 'Attended', value: 'attended' },
            { label: 'Won', value: 'won' },
            { label: 'Registered At', value: 'registeredAt' },
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(dataForCsv);

        res.header('Content-Type', 'text/csv');
        const filename = (event.title || 'event').replace(/[^a-z0-9]/gi, '_');
        res.attachment(`registrations-${filename}.csv`);
        res.send(csv);
    } catch (error) {
        console.error("Error downloading registrations:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Check if a user is registered for an event
const checkRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOne({
            event: req.params.id,
            user: req.user._id,
        });
        if (registration) res.json({ isRegistered: true, registrationId: registration._id });
        else res.json({ isRegistered: false });
    } catch (error) {
        console.error("Error in checkRegistration:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` }); // ✅ fixed 5G00 typo
    }
};

module.exports = {
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
    checkRegistration,
};
