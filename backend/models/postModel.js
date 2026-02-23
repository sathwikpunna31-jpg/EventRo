const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
  {
    user: { // The admin user who created the post
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    event: { // The event this post is promoting
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Event',
    },
    text: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false, // An image is optional
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;