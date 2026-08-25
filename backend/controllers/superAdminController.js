const College = require('../models/collegeModel');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const Announcement = require('../models/announcementModel');

// @desc    Get all colleges
// @route   GET /api/superadmin/colleges
// @access  Private/SuperAdmin
const getColleges = async (req, res) => {
    try {
        const colleges = await College.find({}).sort({ createdAt: -1 });
        res.json(colleges);
    } catch (error) {
        console.error("Error in getColleges:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Approve a college and its admin
// @route   PUT /api/superadmin/colleges/:id/approve
// @access  Private/SuperAdmin
const approveCollege = async (req, res) => {
    try {
        const college = await College.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        // 1. Verify college status
        college.verifiedStatus = 'verified';
        await college.save();

        // 2. Approve the corresponding admin account (by email)
        const adminUser = await User.findOne({ email: college.adminEmail });
        if (adminUser) {
            adminUser.isApproved = true;
            await adminUser.save();
        }

        res.json({ message: `College ${college.name} and its administrator have been successfully approved.` });
    } catch (error) {
        console.error("Error in approveCollege:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Suspend/Reject a college and its admin
// @route   PUT /api/superadmin/colleges/:id/suspend
// @access  Private/SuperAdmin
const suspendCollege = async (req, res) => {
    try {
        const college = await College.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        // 1. Suspend/Reject college
        college.verifiedStatus = 'rejected';
        await college.save();

        // 2. Revoke admin user approval
        const adminUser = await User.findOne({ email: college.adminEmail });
        if (adminUser) {
            adminUser.isApproved = false;
            await adminUser.save();
        }

        res.json({ message: `College ${college.name} has been suspended/rejected.` });
    } catch (error) {
        console.error("Error in suspendCollege:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get platform-wide statistics
// @route   GET /api/superadmin/stats
// @access  Private/SuperAdmin
const getGlobalStats = async (req, res) => {
    try {
        const totalColleges = await College.countDocuments({});
        const totalEvents = await Event.countDocuments({});
        
        // Count students
        const totalStudents = await User.countDocuments({ role: 'student' });
        
        // Count coordinators
        const totalCoordinators = await User.countDocuments({ role: 'clubCoordinator' });
        
        // Count college admins
        const totalAdmins = await User.countDocuments({ role: 'collegeAdmin' });

        res.json({
            totalColleges,
            totalEvents,
            totalStudents,
            totalCoordinators,
            totalAdmins
        });
    } catch (error) {
        console.error("Error in getGlobalStats:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Create global announcement
// @route   POST /api/superadmin/announcement
// @access  Private/SuperAdmin
const createGlobalAnnouncement = async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const announcement = new Announcement({
            title,
            content,
            user: req.user._id, // Platform Super Admin creator
        });

        const createdAnnouncement = await announcement.save();
        res.status(201).json(createdAnnouncement);
    } catch (error) {
        console.error("Error in createGlobalAnnouncement:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

module.exports = {
    getColleges,
    approveCollege,
    suspendCollege,
    getGlobalStats,
    createGlobalAnnouncement
};
