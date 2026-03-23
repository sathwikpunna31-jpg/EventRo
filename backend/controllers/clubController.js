const Club = require('../models/clubModel');
const User = require('../models/userModel');

// @desc    Create a new club
// @route   POST /api/clubs
// @access  Private/CollegeAdmin
const createClub = async (req, res) => {
    const { name, description, email, coordinators } = req.body;

    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required' });
    }

    try {
        const adminUser = await User.findById(req.user._id).populate('college');
        if (!adminUser || !adminUser.college) {
            return res.status(403).json({ message: 'Not authorized or no college associated' });
        }

        const clubExists = await Club.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            college: adminUser.college._id
        });

        if (clubExists) {
            return res.status(400).json({ message: 'A club with this name already exists in your college' });
        }

        if (email) {
            const emailExists = await Club.findOne({ email });
            if (emailExists) return res.status(400).json({ message: 'This email is already registered to a club.' });
        }

        const club = await Club.create({
            name,
            description,
            email: email || undefined,
            college: adminUser.college._id,
            coordinators: coordinators || []
        });

        // Also update the associated users to point to this club
        if (coordinators && coordinators.length > 0) {
            await User.updateMany(
                { _id: { $in: coordinators } },
                { $set: { associatedClub: club._id, role: 'clubCoordinator' } } // Auto promote them
            );
        }

        res.status(201).json(club);
    } catch (error) {
        console.error("Error in createClub:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get all clubs for the admin's college
// @route   GET /api/clubs
// @access  Private
const getClubs = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.college) {
            return res.status(403).json({ message: 'User must belong to a college to view clubs' });
        }

        const clubs = await Club.find({ college: user.college }).populate('coordinators', 'name email');
        res.json(clubs);
    } catch (error) {
        console.error("Error in getClubs:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Update a club
// @route   PUT /api/clubs/:id
// @access  Private/CollegeAdmin
const updateClub = async (req, res) => {
    const { name, description, email, coordinators } = req.body;

    try {
        const adminUser = await User.findById(req.user._id);
        const club = await Club.findById(req.params.id);

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        // Must belong to the same college
        if (club.college.toString() !== adminUser.college.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this club' });
        }

        if (name) club.name = name;
        if (description) club.description = description;
        if (email !== undefined) club.email = email || undefined;

        // Manage coordinators
        if (coordinators) {
            // 1. Remove associatedClub from strictly old coordinators
            const oldCoordinators = club.coordinators.map(c => c.toString());
            const newCoordinators = coordinators.map(c => c.toString());

            const removedCoordinators = oldCoordinators.filter(c => !newCoordinators.includes(c));
            const addedCoordinators = newCoordinators.filter(c => !oldCoordinators.includes(c));

            if (removedCoordinators.length > 0) {
                await User.updateMany(
                    { _id: { $in: removedCoordinators } },
                    { $unset: { associatedClub: "" }, $set: { role: 'student' } }
                );
            }

            if (addedCoordinators.length > 0) {
                await User.updateMany(
                    { _id: { $in: addedCoordinators } },
                    { $set: { associatedClub: club._id, role: 'clubCoordinator' } }
                );
            }

            club.coordinators = coordinators;
        }

        const updatedClub = await club.save();
        const populatedClub = await Club.findById(updatedClub._id).populate('coordinators', 'name email');
        res.json(populatedClub);

    } catch (error) {
        console.error("Error in updateClub:", error);
        if (error.code === 11000) return res.status(400).json({ message: "This email is already in use by another club." });
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
}

// @desc    Delete a club
// @route   DELETE /api/clubs/:id
// @access  Private/CollegeAdmin
const deleteClub = async (req, res) => {
    try {
        const adminUser = await User.findById(req.user._id);
        const club = await Club.findById(req.params.id);

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        if (club.college.toString() !== adminUser.college.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this club' });
        }

        // Remove coordinator linkages
        await User.updateMany(
            { associatedClub: club._id },
            { $unset: { associatedClub: "" }, $set: { role: 'student' } }
        );

        await club.deleteOne();
        res.json({ message: 'Club removed' });

    } catch (error) {
        console.error("Error in deleteClub:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
}

module.exports = {
    createClub,
    getClubs,
    updateClub,
    deleteClub
};
