const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 } // 500KB
});

// Routes
router.post('/', protect, authorize('candidate'), (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 500KB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // An unknown error occurred.
      return res.status(400).json({ error: err.message });
    }
    // Everything went fine.
    next();
  });
}, resumeController.uploadResume);

router.get('/', protect, authorize('candidate'), resumeController.getUserResumes);
router.delete('/:id', protect, authorize('candidate'), resumeController.deleteResume);

module.exports = router;
