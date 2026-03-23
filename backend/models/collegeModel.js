const mongoose = require('mongoose');

const collegeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a college name'],
      unique: true,
    },
    domain: {
      type: String,
      required: [true, 'Please add a college domain'],
    },
    adminEmail: {
      type: String,
      required: [true, 'Please add an administrator email'],
    },
    verifiedStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const College = mongoose.model('College', collegeSchema);

module.exports = College;
