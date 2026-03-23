const mongoose = require('mongoose');

const collegeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        domain: {
            type: String,
            required: true,
            unique: true, // e.g., 'stanford.edu'
        },
        verifiedStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending',
        },
        subscriptionTier: {
            type: String,
            enum: ['free', 'premium', 'enterprise'],
            default: 'free',
        },
        adminEmail: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const College = mongoose.model('College', collegeSchema);
module.exports = College;
