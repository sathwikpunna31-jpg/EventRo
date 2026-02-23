const Announcement = require('../models/announcementModel');

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const announcement = new Announcement({
            title,
            content,
            user: req.user._id, // Set admin user from protect middleware
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
        // Find all announcements, sort by newest first, limit to 10
        const announcements = await Announcement.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name'); // Show the admin's name

        res.json(announcements);
    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (announcement) {
            // Optional: You could restrict deletion to only the user who created it
            // if (announcement.user.toString() !== req.user._id.toString()) {
            //     return res.status(401).json({ message: 'Not authorized' });
            // }

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