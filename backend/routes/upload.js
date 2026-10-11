const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists (use writable /tmp/uploads in serverless environments)
const uploadDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Notice: upload directory creation deferred or read-only:', e.message);
}

// Allowed file extensions & MIME types for security
const ALLOWED_EXTENSIONS = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'txt', 'epub', 'md', 'png', 'jpg', 'jpeg', 'webp'];

// Multer storage configuration with sanitized filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${sanitizedOriginal}`);
  }
});

// File filter function for security
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File format .${ext} is currently not supported.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB strict size limit
});

/**
 * POST /api/upload
 * Accept single document or image file with strict validation
 */
router.post('/upload', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: `Upload Error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
      }

      const { originalname, filename, mimetype, size, path: filePath } = req.file;
      const ext = path.extname(originalname).toLowerCase().replace('.', '');

      let extractedText = '';
      let pageCount = null;

      // Safe server-side text extraction
      if (ext === 'pdf') {
        try {
          const pdfParse = require('pdf-parse');
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);
          extractedText = pdfData.text || '';
          pageCount = pdfData.numpages || null;
        } catch (pdfErr) {
          console.warn('Backend pdf-parse note:', pdfErr.message);
        }
      } else if (['txt', 'md', 'json', 'csv'].includes(ext)) {
        extractedText = fs.readFileSync(filePath, 'utf8');
      }

      res.json({
        success: true,
        message: 'File uploaded and validated successfully',
        file: {
          id: `srv-${filename}`,
          title: originalname.replace(/\.[^/.]+$/, ''),
          filename: originalname,
          type: ext,
          sizeBytes: size,
          path: `/uploads/${filename}`,
          content: extractedText,
          pageCount
        }
      });

    } catch (err) {
      console.error('Server upload error:', err);
      res.status(500).json({ success: false, error: 'Failed to process uploaded file.' });
    }
  });
});

module.exports = router;
