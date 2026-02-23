const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['student', 'collegeAdmin'],
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
    collegeName: {
      type: String,
      required: false, // Required for students
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;