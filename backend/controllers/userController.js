const User = require('../models/userModel');
const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');
const College = require('../models/collegeModel'); // <-- Imported College
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
const registerUser = async (req, res) => {
    // Note: The frontend is currently sending 'collegeName' as the text input for now.
    const { name, email, password, role, collegeName, year } = req.body;

    if (!name || !email || !password || !role || !collegeName) {
        return res.status(400).json({ message: 'Please enter all required fields including a college name.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // --- B2B LOGIC: Find or Create the College First ---
        let collegeDoc = await College.findOne({ name: { $regex: new RegExp(`^${collegeName}$`, 'i') } });
        const domain = email.split('@')[1];

        if (!collegeDoc) {
            // Create a new college document
            collegeDoc = await College.create({
                name: collegeName,
                domain: domain,
                adminEmail: role === 'collegeAdmin' ? email : 'pending@admin.com',
                verifiedStatus: role === 'collegeAdmin' ? 'verified' : 'pending' // Admins verify immediately for now
            });
        } else {
            // --- NEW B2B SECURITY: Domain Verification ---
            // Enforce that students must sign up with an email matching the college's listed domain
            if (role === 'student' && collegeDoc.domain && domain !== collegeDoc.domain) {
                return res.status(403).json({ message: `Student emails must end with the official college domain: @${collegeDoc.domain}` });
            }
        }
        // ---------------------------------------------------

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user, securely linking their strictly typed ObjectID college
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            year: role === 'student' ? year : undefined, // Save year for students
            savedEvents: [],
            college: collegeDoc._id // <-- THIS IS THE CRUX OF PHASE 1
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                savedEvents: user.savedEvents,
                college: collegeDoc, // Return the whole college object to the frontend
                isApproved: user.isApproved,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Authenticate user & get token (Login)
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
            .select('+password')
            .populate('college'); // Populate the new College object

        if (user && (await bcrypt.compare(password, user.password))) {

            // --- NEW B2B SECURITY: Admin Approval Check ---
            if (!user.isApproved) {
                return res.status(403).json({ message: 'Your account is pending approval by the Super Admin.' });
            }
            // ----------------------------------------------

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                savedEvents: user.savedEvents || [],
                college: user.college, // Return populated college object
                isApproved: user.isApproved,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get a user's event registrations (list of events)
const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user._id })
            .populate('event');
        const events = registrations.map(reg => reg.event).filter(event => event != null);
        res.json(events);
    } catch (error) {
        console.error("Error in getMyRegistrations:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('savedEvents')
            .populate('college'); // Populate the new College object

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                savedEvents: user.savedEvents || [],
                college: user.college, // Return populated college object
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Update user profile (e.g., name)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            const updatedUser = await user.save();
            await updatedUser.populate('college'); // Populate before returning

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profilePicture: updatedUser.profilePicture,
                savedEvents: updatedUser.savedEvents || [],
                college: updatedUser.college,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Upload user profile picture
const uploadProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            if (req.file) {
                user.profilePicture = `/uploads/${req.file.filename}`;
                const updatedUser = await user.save();
                res.json({
                    _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role,
                    profilePicture: updatedUser.profilePicture, savedEvents: updatedUser.savedEvents || [],
                    collegeName: updatedUser.collegeName,
                });
            } else {
                res.status(400).json({ message: 'No image file uploaded' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error in uploadProfilePicture:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Update user password
const updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Please provide current password and a new password (min 6 chars).' });
    }
    try {
        const user = await User.findById(req.user._id).select('+password');
        if (!user) { return res.status(404).json({ message: 'User not found' }); }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) { return res.status(401).json({ message: 'Incorrect current password.' }); }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error("Error in updateUserPassword:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get reviews submitted by the user
const getMyReviews = async (req, res) => {
    try {
        const eventsWithUserReviews = await Event.find({ 'reviews.user': req.user._id })
            .select('title reviews college date');
        const userReviews = eventsWithUserReviews.map(event => {
            const review = event.reviews.find(r => r.user.toString() === req.user._id.toString());
            if (!review) return null;
            return {
                eventId: event._id, eventTitle: event.title, eventDate: event.date, eventCollege: event.college,
                rating: review.rating, comment: review.comment, reviewDate: review.createdAt, reviewId: review._id
            };
        }).filter(r => r != null)
            .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
        res.json(userReviews);
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get questions asked by the user
const getMyQuestions = async (req, res) => {
    try {
        const eventsWithUserQuestions = await Event.find({ 'questions.user': req.user._id })
            .select('title questions college date');
        const userQuestions = eventsWithUserQuestions.flatMap(event =>
            event.questions
                .filter(q => q.user.toString() === req.user._id.toString())
                .map(q => ({
                    eventId: event._id, eventTitle: event.title, eventCollege: event.college, questionId: q._id,
                    question: q.question, answer: q.answer, askedDate: q.createdAt,
                }))
        ).sort((a, b) => new Date(b.askedDate) - new Date(a.askedDate));
        res.json(userQuestions);
    } catch (error) {
        console.error("Error fetching user questions:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Add an event to user's saved list
const saveEvent = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const eventId = req.params.eventId;
        if (!user) return res.status(404).json({ message: 'User not found' });
        const eventExists = await Event.findById(eventId);
        if (!eventExists) return res.status(404).json({ message: 'Event not found' });
        if (!user.savedEvents) { user.savedEvents = []; }
        if (!user.savedEvents.includes(eventId)) {
            user.savedEvents.push(eventId);
            await user.save();
            res.json({ savedEvents: user.savedEvents });
        } else {
            res.status(400).json({ message: 'Event already saved' });
        }
    } catch (error) {
        console.error("Error in saveEvent:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Remove an event from user's saved list
const unsaveEvent = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const eventId = req.params.eventId;
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.savedEvents) { user.savedEvents = []; }
        user.savedEvents = user.savedEvents.filter(id => id.toString() !== eventId);
        await user.save();
        res.json({ savedEvents: user.savedEvents });
    } catch (error) {
        console.error("Error in unsaveEvent:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get user's saved events
const getSavedEvents = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('savedEvents');
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.savedEvents) { user.savedEvents = []; }
        user.savedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        res.json(user.savedEvents);
    } catch (error) {
        console.error("Error in getSavedEvents:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get all of a user's registration documents (for stats)
const getMyFullRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user._id })
            .populate('event', 'title date category');
        res.json(registrations);
    } catch (error) {
        console.error("Error in getMyFullRegistrations:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Create a student account (Admin only)
const createStudent = async (req, res) => {
    // --- NEW: Added department, year, and section ---
    const { name, email, password, department, year, section } = req.body;

    // Admin must have a college to assign to student
    const adminUser = await User.findById(req.user._id).populate('college');
    if (!adminUser || !adminUser.college) {
        return res.status(403).json({ message: 'Admin not associated with a college' });
    }

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'student',
            college: adminUser.college._id, // Guarantee B2B link
            department: department || undefined,
            year: year || undefined,
            section: section || undefined,
            savedEvents: [],
        });

        if (user) {
            // Populate department before sending back
            const populatedUser = await User.findById(user._id).populate('department', 'name');
            res.status(201).json(populatedUser);
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Error in createStudent:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get all students for the admin's college
const getStudents = async (req, res) => {
    try {
        const adminUser = await User.findById(req.user._id);

        const students = await User.find({
            role: 'student',
            college: adminUser.college
        })
            .select('-password') // Exclude password
            .populate('department', 'name'); // Fetch department name

        res.json(students);
    } catch (error) {
        console.error("Error in getStudents:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Delete a student account
const deleteStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await student.deleteOne();
        res.json({ message: 'Student removed' });
    } catch (error) {
        console.error("Error in deleteStudent:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Bulk create students from CSV/JSON
const bulkCreateStudents = async (req, res) => {
    const { students } = req.body; // Expecting array of { name, email, password, department, year, section }

    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ message: 'No student data provided' });
    }

    const adminUser = await User.findById(req.user._id);

    let createdCount = 0;
    let errors = [];

    try {
        for (const studentData of students) {
            const { name, email, password, department, year, section } = studentData;

            if (!name || !email || !password) {
                errors.push({ email, message: 'Missing fields' });
                continue;
            }

            // Check if user exists
            const userExists = await User.findOne({ email });
            if (userExists) {
                errors.push({ email, message: 'User already exists' });
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'student',
                college: adminUser.college, // strict B2B link
                department: department || undefined,
                year: year || undefined,
                section: section || undefined,
                savedEvents: []
            });
            createdCount++;
        }

        res.status(201).json({
            message: `Successfully created ${createdCount} students.`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("Error in bulkCreateStudents:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMyRegistrations,
    getUserProfile,
    updateUserProfile,
    uploadProfilePicture,
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
    bulkCreateStudents,
};