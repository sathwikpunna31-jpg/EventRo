const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostsByEvent,
  deletePost,
  getMyPosts, // <-- Import it
  likePost,
  addComment
} = require('../controllers/postController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getPosts).post(protect, admin, upload.single('image'), createPost);

// --- ADD THIS NEW ROUTE ---
// GET /api/posts/myposts
router.route('/myposts').get(protect, admin, getMyPosts);

router.route('/event/:eventId').get(getPostsByEvent);
router.route('/:id').delete(protect, admin, deletePost);

// Social Features
router.route('/:id/like').put(protect, likePost); // Any logged in user can like
router.route('/:id/comment').post(protect, addComment); // Any logged in user can comment

module.exports = router;