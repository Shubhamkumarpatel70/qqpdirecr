import multer from 'multer';
import path from 'path';
import express from 'express';
import Post from '../models/Post.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// POST: Create a new post with optional file and link
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  const { title, content, courseCategory, link } = req.body;

  if (!title || !content || !courseCategory) {
    return res.status(400).json({ error: 'Title, content, and course category are required' });
  }

  try {
    const newPost = new Post({
      title,
      content,
      courseCategory,
      user: req.user.id,
      status: 'pending',
      file: req.file ? req.file.filename : null, // Save file name if uploaded
      link: link || null // Save link if provided
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET: Fetch all posts
router.get('/', authMiddleware, async (req, res) => {
  try {
    let posts;
    if (req.user.role === 'admin') {
      posts = await Post.find().populate('user', 'name email role').sort({ createdAt: -1 });
    } else {
      posts = await Post.find({ status: { $in: ['coming soon', 'approved'] } }).populate('user', 'name email').sort({ createdAt: -1 });
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET: Fetch user's own posts
router.get('/my-posts', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// PUT: Update post (user can update their own posts)
router.put('/:id', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only update your own posts.' });
    }

    const { title, content, courseCategory, link } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (courseCategory) post.courseCategory = courseCategory;
    if (link !== undefined) post.link = link;
    if (req.file) post.file = req.file.filename;

    await post.save();
    await post.populate('user', 'name email');

    // Emit socket event to all connected clients
    req.io.emit('postUpdated', post);

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// PUT: Update post status (admin only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { status } = req.body;
    if (!['pending', 'coming soon', 'approved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const post = await Post.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user', 'name email role');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Emit socket event to all connected clients
    req.io.emit('postUpdated', post);

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post status' });
  }
});

// PUT: Like/unlike a post
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { like } = req.body;
    if (like) {
      post.likes += 1;
    } else {
      post.likes = Math.max(0, post.likes - 1);
    }

    await post.save();

    // Emit socket event to all connected clients
    req.io.emit('postUpdated', post);

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update like' });
  }
});

// DELETE: Delete a post by ID
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Emit socket event to notify clients about the deleted post
    req.io.emit('postDeleted', { id: req.params.id });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;