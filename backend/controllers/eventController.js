const User = require('../models/userModel');
const Event = require('../models/eventModel');
const Notification = require('../models/notificationModel');
const Registration = require('../models/registrationModel');
const College = require('../models/collegeModel'); // Added College import
const { Parser } = require('json2csv');

// @desc    Create a new event
const createEvent = async (req, res) => {
    const { title, description, date, category, imageUrl, isFree, price, club } = req.body;

    try {
        // Enforce B2B: Obtain the college strictly from the logged-in User's profile
        const user = await User.findById(req.user._id);
        if (!user.college) {
            return res.status(403).json({ message: 'User is not associated with a College. Cannot create event.' });
        }

        // --- NEW B2B LOGIC: Club Associated Events ---
        // If the user is a clubCoordinator, look up the club they coordinate
        let eventClubId = club;
        if (!eventClubId && user.role === 'clubCoordinator') {
            const Club = require('../models/clubModel');
            const myClub = await Club.findOne({ coordinators: user._id });
            if (myClub) eventClubId = myClub._id;
        }

        const event = new Event({
            title,
            description,
            college: user.college, // STRICT LINK to College model
            club: eventClubId, // Link to club if provided or if user is a coordinator
            date,
            category,
            imageUrl,
            user: req.user._id,
            isFree,
            price: isFree ? 0 : price,
            visibility: req.body.visibility || 'private', // Default to private
        });
        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        console.error("Error in createEvent:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Fetch all events
const getEvents = async (req, res) => {
    try {
        const { visibility, college } = req.query; // 'college' here is a string name from the frontend
        let query = {};

        if (visibility === 'public') {
            query.visibility = 'public';
        } else if (college) {
            let collegeDoc;
            // Check if 'college' is a valid ObjectId
            if (college.match(/^[0-9a-fA-F]{24}$/)) {
                const College = require('../models/collegeModel');
                collegeDoc = await College.findById(college);
            } else {
                // Find the college ObjectId by name
                const College = require('../models/collegeModel');
                collegeDoc = await College.findOne({ name: { $regex: new RegExp(`^${college}$`, 'i') } });
            }

            if (collegeDoc) {
                query = {
                    $or: [
                        { visibility: 'public' },
                        { college: collegeDoc._id, visibility: 'private' }
                    ]
                };
            } else {
                query.visibility = 'public'; // Fallback if college not found
            }
        } else {
            // Default: Return ONLY public events if no college specified
            query.visibility = 'public';
        }

        const events = await Event.find(query)
            .populate('user', 'name')
            .populate('college', 'name domain') // Populate college
            .populate('club', 'name'); // Populate club

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

const nodemailer = require('nodemailer');

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

        // --- NEW: Send Confirmation Email via Nodemailer ---
        try {
            // Use Ethereal for testing if proper SMTP credentials aren't set in .env
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.ethereal.email',
                port: process.env.SMTP_PORT || 587,
                auth: {
                    user: process.env.SMTP_USER || 'leola.mccullough22@ethereal.email', // Replace with generated ethereal account for testing
                    pass: process.env.SMTP_PASS || 'R45bX6gPvwD5nNw3dY'
                }
            });

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #2575fc; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">Registration Confirmed! 🎉</h1>
                    </div>
                    <div style="padding: 20px; background-color: #f9f9f9;">
                        <p style="font-size: 16px; color: #333;">Hi <strong>${req.user.name}</strong>,</p>
                        <p style="font-size: 16px; color: #555;">You have successfully registered for:</p>
                        <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 5px solid #2575fc; margin: 20px 0;">
                            <h2 style="margin: 0 0 10px 0; color: #333;">${event.title}</h2>
                            <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                            <p style="margin: 5px 0; color: #666;"><strong>Location:</strong> ${collegeName}</p>
                        </div>
                        <p style="font-size: 14px; color: #777;">Please keep this email for your records. You can also view your ticket in the Tracking Portal.</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:3000/track-progress" style="background-color: #2575fc; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Track Progress Dashboard</a>
                        </div>
                    </div>
                </div>
            `;

            const info = await transporter.sendMail({
                from: '"Eventro Platform" <noreply@eventro.com>',
                to: req.user.email,
                subject: `Registration Confirmed: ${event.title}`,
                html: emailHtml,
            });

            console.log("Confirmation email sent: %s", info.messageId);
            if (!process.env.SMTP_HOST) {
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            }
        } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
            // We don't fail the registration if the email fails
        }
        // ----------------------------------------------------

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
        const events = await Event.find({ user: req.user._id })
            .populate('college', 'name')
            .populate('club', 'name')
            .lean();

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
    const { title, description, college, date, category, imageUrl, isFree, price } = req.body;
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

// @desc    Toggle attendance or win status for a specific registration
const toggleAttendance = async (req, res) => {
    try {
        const { id, registrationId } = req.params;
        const { attended, didWin } = req.body;

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Ensure user owns this event
        if (event.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: 'Not authorized' });

        const registration = await Registration.findOne({ _id: registrationId, event: id });
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        if (attended !== undefined) registration.attended = attended;
        if (didWin !== undefined) registration.didWin = didWin;

        await registration.save();

        res.json(registration);
    } catch (error) {
        console.error("Error in toggleAttendance:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get top popular events
const getPopularEvents = async (req, res) => {
    try {
        const popularEventIds = await Registration.aggregate([
            { $group: { _id: "$event", registrationCount: { $sum: 1 } } },
            { $sort: { registrationCount: -1 } },
            { $limit: 8 }
        ]);

        const eventIds = popularEventIds.map(e => e._id);
        const events = await Event.find({ _id: { $in: eventIds } });

        const popularEvents = events.map(event => {
            const stats = popularEventIds.find(e => e._id.equals(event._id));
            return { ...event.toObject(), registrationCount: stats?.registrationCount || 0 };
        });

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

// @desc    Get analytics for the admin's college
const getCollegeAnalytics = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('college');
        if (!user || !user.college) {
            return res.status(403).json({ message: 'User is not associated with a college.' });
        }

        const collegeId = user.college._id;

        // 1. Total Events belonging to this college
        const totalEvents = await Event.countDocuments({ college: collegeId });

        // 2. Total Registrations for these events
        // First get all event IDs for this college
        const collegeEvents = await Event.find({ college: collegeId }).select('_id title');
        const eventIds = collegeEvents.map(e => e._id);

        const totalRegistrations = await Registration.countDocuments({ event: { $in: eventIds } });

        // 3. Average Turnout (Attended / Total Registrations)
        const attendedRegistrations = await Registration.countDocuments({
            event: { $in: eventIds },
            attended: true
        });

        const averageTurnout = totalRegistrations > 0
            ? ((attendedRegistrations / totalRegistrations) * 100).toFixed(1)
            : 0;

        // 4. Most Popular Events within the college
        const popularEventsData = await Registration.aggregate([
            { $match: { event: { $in: eventIds } } },
            { $group: { _id: "$event", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Populate event names for popular events
        const popularEvents = await Promise.all(popularEventsData.map(async (item) => {
            const event = await Event.findById(item._id).select('title');
            return {
                title: event ? event.title : 'Unknown Event',
                registrations: item.count
            };
        }));

        res.json({
            totalEvents,
            totalRegistrations,
            attendedRegistrations,
            averageTurnout,
            popularEvents
        });

    } catch (error) {
        console.error("Error in getCollegeAnalytics:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
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
    toggleAttendance,
    getPopularEvents,
    downloadRegistrations,
    checkRegistration,
    getCollegeAnalytics,
};
