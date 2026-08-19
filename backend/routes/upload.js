const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
});

/**
 * POST /api/upload
 * Accept single document or image file
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;
    const ext = path.extname(originalname).toLowerCase().replace('.', '');

    let extractedText = '';
    let pageCount = null;

    // Optional server-side PDF text extraction using pdf-parse if available
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
      message: 'File uploaded successfully',
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
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
