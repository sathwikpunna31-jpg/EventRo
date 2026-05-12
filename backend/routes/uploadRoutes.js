const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'eventro_uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    },
});

const upload = multer({ storage: storage });

// @desc    Upload an image
// @route   POST /api/upload
// @access  Public (or Private depending on your auth middleware)
router.post('/', upload.single('image'), (req, res) => {
    if (req.file && req.file.path) {
        // req.file.path contains the permanent Cloudinary URL
        res.send(req.file.path);
    } else {
        res.status(400).send('Image upload failed');
    }
});

module.exports = router;
