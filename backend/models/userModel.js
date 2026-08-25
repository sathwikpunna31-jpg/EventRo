const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['student', 'clubCoordinator', 'collegeAdmin', 'superAdmin'],
      default: 'student',
    },
    profilePicture: {
      type: String,
      default: '/images/default-avatar.png',
    },
    savedEvents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    }],
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: false, // Everyone must belong to a college (except superAdmins)
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'active',
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === 'student'; // Students auto-approved, others need manual approval
      }
    },
    associatedClub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: false, // Only relevant for clubCoordinators
    },
    // --- Phase 1: Academic Structure ---
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: false, // Optional initially, admins can assign later
    },
    year: {
      type: String, // e.g. "1st", "2nd", "3rd", "4th", "5th"
      required: false,
    },
    section: {
      type: String, // String matching one of the department's sections
      required: false,
    },
    // -----------------------------------
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;