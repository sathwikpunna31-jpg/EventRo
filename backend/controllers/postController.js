const Post = require('../models/postModel');
const Event = require('../models/eventModel');

// @desc    Create a new post for an event
// @route   POST /api/posts
// @access  Private/Admin
const createPost = async (req, res) => {
  const { text, imageUrl, eventId } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to post for this event' });
    }

    const post = new Post({
      text,
      imageUrl,
      event: eventId, // Make sure this is saving the ID
      user: req.user._id,
    });

    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get all posts for a feed
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('event', 'title imageUrl') // Changed bannerImage to imageUrl
      .populate('user', 'name')
      .populate('comments.user', 'name');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get all posts for a specific event
// @route   GET /api/posts/event/:eventId
// @access  Public
const getPostsByEvent = async (req, res) => {
  try {
    // This query finds Posts where the 'event' field matches the eventId from the URL
    const posts = await Post.find({ event: req.params.eventId })
      .sort({ createdAt: -1 })
      .populate('user', 'name');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the logged-in user is the admin who created the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const getMyPosts = async (req, res) => {
  try {
    // req.user._id is available from 'protect' middleware
    const posts = await Post.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('event', 'title') // Get the event title
      .populate('user', 'name');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Like or Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the post has already been liked by this user
    if (post.likes.includes(req.user._id)) {
      // Unlike logic
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Like logic
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  const { text } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      text,
      createdAt: Date.now(),
    };

    post.comments.push(comment);

    await post.save();

    // Populate the user of the new comment to return it immediately
    // Note: This is a bit tricky with Mongoose subdocs, so we might just return the whole post populated
    const updatedPost = await Post.findById(req.params.id)
      .populate('user', 'name')
      .populate('comments.user', 'name');

    res.json(updatedPost.comments);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};


// --- UPDATE EXPORTS ---
// --- UPDATE EXPORTS ---
module.exports = {
  createPost,
  getPosts,
  getPostsByEvent,
  deletePost,
  getMyPosts,
  likePost,
  addComment,
};