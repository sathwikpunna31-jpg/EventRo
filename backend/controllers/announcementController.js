const Announcement = require('../models/announcementModel');
const User = require('../models/userModel');

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (Admin or Coordinator)
const createAnnouncement = async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const user = await User.findById(req.user._id).populate('college');

        if (!user.college) {
            return res.status(403).json({ message: 'User must belong to a college to post announcements' });
        }

        const announcement = new Announcement({
            title,
            content,
            user: req.user._id,
            college: user.college._id,
            // If the user is a coordinator, automatically link this announcement to their club
            club: user.role === 'clubCoordinator' ? user.associatedClub : undefined
        });

        const createdAnnouncement = await announcement.save();
        res.status(201).json(createdAnnouncement);
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all announcements (public)
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = async (req, res) => {
    try {
        const { college } = req.query;
        let query = {};

        if (college) {
            const College = require('../models/collegeModel');
            const collegeDoc = await College.findOne({ name: { $regex: new RegExp(`^${college}$`, 'i') } });
            if (collegeDoc) {
                query.college = collegeDoc._id;
            } else {
                return res.json([]); // Return empty if college not found
            }
        }

        // Find all announcements matching query, sort by newest first, limit to 20
        const announcements = await Announcement.find(query)
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('user', 'name role')
            .populate('club', 'name'); // Populate club name so frontend knows it's from a club

        res.json(announcements);
    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin or Coordinator owner)
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (announcement) {
            // Allow deletion if Super Admin or if it's the Coordinator who made it
            if (req.user.role !== 'superAdmin' && announcement.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to delete this announcement' });
            }

            await announcement.deleteOne();
            res.json({ message: 'Announcement removed' });
        } else {
            res.status(404).json({ message: 'Announcement not found' });
        }
    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement,
};