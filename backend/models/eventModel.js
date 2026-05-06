const mongoose = require('mongoose');

// --- Review Schema (Stays the same) ---
const reviewSchema = mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

// --- Question Schema (Stays the same) ---
const questionSchema = mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
}, { timestamps: true });

// --- Main Event Schema (Reverted) ---
const eventSchema = mongoose.Schema(
  {
    user: { // The Admin who created the event
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: { type: String, required: true },
    description: { type: String, required: true },

    // --- College is back to a String ---
    college: {
      type: String,
      required: true,
    },
    // ---------------------------------

    date: { type: Date, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },

    // Using the simple, stable registration array
    registrations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // --- Visibility Field ---
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
      required: true,
    },
    // ------------------------

    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    questions: [questionSchema],
    isFree: { type: Boolean, required: true, default: true },
    price: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;