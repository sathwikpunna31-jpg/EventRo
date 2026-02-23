const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Event',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    collegeName: {
      type: String,
      required: true,
    },
    yearOfStudy: {
      type: String,
      required: false,
    },

    // --- NEW FIELDS ---
    attended: {
      type: Boolean,
      default: false,
    },
    didWin: {
      type: Boolean,
      default: false,
    },
    certificationUrl: {
      type: String,
      default: '',
    },
    // ------------------
  },
  {
    timestamps: true,
  }
);

// Prevent a user from registering for the same event twice
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;