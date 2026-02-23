const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // --- THIS IS THE FIX ---
    // It should just be 'backend/uploads/' or simply 'uploads/' if your
    // server process is already running from the 'backend' directory.
    // Let's use 'uploads/' for simplicity as long as you run `npm run dev`
    // from inside the 'backend' folder.
    cb(null, 'uploads/'); // Correct destination folder
  },
  filename(req, file, cb) {
    // Create unique filename: fieldname-timestamp.ext
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type
function checkFileType(file, cb) {
  // ... (this function is likely correct)
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Initialize upload middleware
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload; // Ensure this export is correct