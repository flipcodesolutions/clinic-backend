const path = require('path');

const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const category = req.params.category ? req.params.category.toLowerCase() : 'general';
    const relativeUrl = `/uploads/${category}/${req.file.filename}`;
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        category,
        url: relativeUrl,
        fullUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const category = req.params.category ? req.params.category.toLowerCase() : 'general';
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';

    const uploadedFiles = req.files.map((file) => {
      const relativeUrl = `/uploads/${category}/${file.filename}`;
      return {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        category,
        url: relativeUrl,
        fullUrl: `${protocol}://${host}${relativeUrl}`,
      };
    });

    return res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
};
