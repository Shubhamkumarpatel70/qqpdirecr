import express from 'express';
import PYQ from '../models/PYQ.js';
import auth from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get all PYQs with filtering
router.get('/', auth, async (req, res) => {
  try {
    const { course, year, semester, subject } = req.query;
    let filter = {};

    if (course) filter.course = course;
    if (year) filter.year = year;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;

    const pyqs = await PYQ.find(filter)
      .populate('createdBy', 'name')
      .populate('course', 'name code')
      .populate('year', 'year')
      .populate('semester', 'name number')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });
    res.json(pyqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new PYQ
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, content, courseCategory, course, year, semester, subject, college, program, batch, link, status } = req.body;
    const pyq = new PYQ({
      title,
      content,
      courseCategory,
      course,
      year,
      semester,
      subject,
      college,
      program,
      batch,
      file: req.file ? req.file.filename : null,
      link,
      status: status || 'approved',
      createdBy: req.user.id
    });
    await pyq.save();
    res.status(201).json(pyq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a PYQ
router.delete('/:id', auth, async (req, res) => {
  try {
    await PYQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'PYQ deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
