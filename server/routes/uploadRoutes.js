const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    uploadZip,
    getUploads,
    deleteUpload,
    renameUpload,
    getPreviewList,
    getFilePreview,
    getStats,
    downloadZip
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /zip/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname || mimetype) {
            return cb(null, true);
        } else {
            cb('Error: ZIP Files Only!');
        }
    },
});

router.post('/', protect, upload.single('zip'), uploadZip);
router.get('/', protect, getUploads);
router.delete('/:id', protect, deleteUpload);
router.put('/:id', protect, renameUpload);
router.get('/preview/:id', protect, getPreviewList);
router.get(/\/preview\/(?<id>[^\/]+)\/file\/(?<filePath>.+)/, protect, getFilePreview);
router.get('/stats', protect, getStats);
router.get('/download/:id', protect, downloadZip);

module.exports = router;
