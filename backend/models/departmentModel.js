const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        college: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'College',
        },
        sections: [{
            type: String, // E.g., 'A', 'B', 'C'
        }],
        years: [{
            type: String, // E.g., '1st Year', '2nd Year'
        }],
    },
    { timestamps: true }
);

// Prevent duplicate department names within the same college
departmentSchema.index({ name: 1, college: 1 }, { unique: true });

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;
