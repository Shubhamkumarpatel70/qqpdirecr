import express from 'express';
import Search from '../models/Search.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Get most searched terms
router.get('/most-searched', auth, async (req, res) => {
  try {
    const mostSearched = await Search.aggregate([
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(mostSearched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a search query
router.post('/', auth, async (req, res) => {
  try {
    const { query } = req.body;
    const search = new Search({
      query,
      user: req.user.id
    });
    await search.save();
    res.status(201).json(search);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
