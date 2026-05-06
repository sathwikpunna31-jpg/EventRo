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
    // You could add an 'audience' field later (e.g., 'all', 'students')
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;