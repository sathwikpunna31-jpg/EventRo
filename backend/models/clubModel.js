const mongoose = require('mongoose');

const clubSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        college: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'College',
        },
        logo: {
            type: String,
            default: '/images/default-club.png',
        },
        email: {
            type: String,
            required: false, // Optional, can be added later by Admin
            unique: true,
            sparse: true,    // Allows multiple nulls while ensuring uniqueness for non-nulls
        },
        coordinators: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        active: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

const Club = mongoose.model('Club', clubSchema);
module.exports = Club;
