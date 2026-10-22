const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${uuidv4().substring(0, 8)}${ext}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max
});

// Upload attachment
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const id = 'att-' + uuidv4().substring(0, 8);
    const { originalname, filename, mimetype, size, path: filePath } = req.file;

    db.prepare(`
      INSERT INTO attachments (id, original_name, filename, mime_type, size, path)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, originalname, filename, mimetype, size, filePath);

    res.json({
      success: true,
      attachment: {
        id,
        original_name: originalname,
        filename,
        mime_type: mimetype,
        size
      }
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Download attachment
router.get('/file/:filename', (req, res) => {
  const file = path.join(uploadsDir, req.params.filename);
  if (fs.existsSync(file)) {
    res.sendFile(file);
  } else {
    res.status(404).send('File not found');
  }
});

module.exports = router;
