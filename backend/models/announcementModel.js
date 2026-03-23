const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    user: { // The admin user who created the announcement
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true // Every announcement must be scoped to a college at least
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: false // Optional, if set, it's a club-specific announcement
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;