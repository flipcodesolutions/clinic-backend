const express = require('express');
const upload = require('../middleware/upload.middleware');
const { uploadSingleFile, uploadMultipleFiles } = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Single file upload endpoint (e.g. POST /api/upload/gallery or /api/upload/doctors)
router.post('/:category', upload.single('file'), uploadSingleFile);

// Multiple files upload endpoint (e.g. POST /api/upload/gallery/multiple)
router.post('/:category/multiple', upload.array('files', 10), uploadMultipleFiles);

module.exports = router;
