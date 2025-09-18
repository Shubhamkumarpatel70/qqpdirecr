import express from 'express';
const router = express.Router();
import Contact from '../models/Contact.js';
import authMiddleware from '../middleware/authMiddleware.js';

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contact = new Contact({
      name,
      email,
      message
    });

    await contact.save();

    res.status(201).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/contact - Get all contact responses (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contact responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
