const Department = require('../models/departmentModel');
const User = require('../models/userModel');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/CollegeAdmin
const createDepartment = async (req, res) => {
    const { name, sections, years } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Department name is required' });
    }

    try {
        const adminUser = await User.findById(req.user._id).populate('college');
        if (!adminUser || !adminUser.college) {
            return res.status(403).json({ message: 'Not authorized or no college associated' });
        }

        const departmentExists = await Department.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            college: adminUser.college._id
        });

        if (departmentExists) {
            return res.status(400).json({ message: 'Department already exists in this college' });
        }

        // Format sections (ensure it's an array of strings)
        let formattedSections = [];
        if (sections) {
            if (Array.isArray(sections)) {
                formattedSections = sections.map(s => String(s).trim());
            } else if (typeof sections === 'string') {
                formattedSections = sections.split(',').map(s => s.trim());
            }
        }

        let formattedYears = [];
        if (years) {
            if (Array.isArray(years)) {
                formattedYears = years.map(s => String(s).trim());
            } else if (typeof years === 'string') {
                formattedYears = years.split(',').map(s => s.trim());
            }
        }

        const department = await Department.create({
            name,
            college: adminUser.college._id,
            sections: formattedSections,
            years: formattedYears
        });

        res.status(201).json(department);
    } catch (error) {
        console.error("Error in createDepartment:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get all departments for the admin/user's college
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.college) {
            return res.status(403).json({ message: 'User must belong to a college to view departments' });
        }

        const departments = await Department.find({ college: user.college });
        res.json(departments);
    } catch (error) {
        console.error("Error in getDepartments:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Update a department (e.g., add sections)
// @route   PUT /api/departments/:id
// @access  Private/CollegeAdmin
const updateDepartment = async (req, res) => {
    const { name, sections, years } = req.body;

    try {
        const adminUser = await User.findById(req.user._id);
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Must belong to the same college
        if (department.college.toString() !== adminUser.college.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this department' });
        }

        if (name) department.name = name;
        if (sections) {
            if (Array.isArray(sections)) {
                department.sections = sections.map(s => String(s).trim());
            } else if (typeof sections === 'string') {
                department.sections = sections.split(',').map(s => s.trim());
            }
        }
        if (years) {
            if (Array.isArray(years)) {
                department.years = years.map(s => String(s).trim());
            } else if (typeof years === 'string') {
                department.years = years.split(',').map(s => s.trim());
            }
        }

        const updatedDepartment = await department.save();
        res.json(updatedDepartment);
    } catch (error) {
        console.error("Error in updateDepartment:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
}

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/CollegeAdmin
const deleteDepartment = async (req, res) => {
    try {
        const adminUser = await User.findById(req.user._id);
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        if (department.college.toString() !== adminUser.college.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this department' });
        }

        // Clear the department from users who had it assigned
        await User.updateMany(
            { department: department._id },
            { $unset: { department: "", section: "" } }
        );

        await department.deleteOne();
        res.json({ message: 'Department removed' });

    } catch (error) {
        console.error("Error in deleteDepartment:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
}

module.exports = {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment
};
