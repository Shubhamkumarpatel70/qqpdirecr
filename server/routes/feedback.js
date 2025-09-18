import express from 'express';
import Feedback from '../models/Feedback.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const newFeedback = new Feedback({
      message,
      user: req.user.id
    });
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error while submitting feedback.' });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback
// @access  Admin
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    const feedback = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching feedback.' });
  }
});

export default router;
