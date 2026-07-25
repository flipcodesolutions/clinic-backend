const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_CATEGORIES = ['gallery', 'doctors', 'clinics', 'users', 'documents', 'general'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.params.category && ALLOWED_CATEGORIES.includes(req.params.category.toLowerCase())
      ? req.params.category.toLowerCase()
      : 'general';

    const dir = path.join(__dirname, '..', 'uploads', category);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, GIF, SVG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

module.exports = upload;
