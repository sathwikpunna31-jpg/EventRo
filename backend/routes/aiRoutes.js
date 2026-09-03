const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
    parsePoster,
    chatConcierge,
    syncEmbeddings,
} = require('../controllers/aiController');

// Memory storage for poster buffer parsing with Gemini Vision
const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed for poster scanning.'), false);
        }
    },
});

// Route to parse event poster with Gemini Vision
router.post('/parse-poster', protect, memoryUpload.single('poster'), parsePoster);

// Route for Campus RAG Event Concierge
router.post('/chat', chatConcierge);

// Route to sync embeddings for existing events
router.post('/sync-embeddings', protect, syncEmbeddings);

module.exports = router;
