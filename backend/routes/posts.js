import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { createPost, getAllPosts, getPostsByOperator, deletePost, updatePost } from '../database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOADS_DIR
      ? path.resolve(process.env.UPLOADS_DIR)
      : path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Create a post (operator only)
router.post('/create', upload.fields([{ name: 'beforeImage' }, { name: 'afterImage' }]), (req, res) => {
  try {
    const { operatorId, typeOfWork, hoursWorked, userRating, description } = req.body;

    if (!operatorId || !typeOfWork || !hoursWorked) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.files || !req.files.beforeImage || !req.files.afterImage) {
      return res.status(400).json({ error: 'Both before and after images are required' });
    }

    const post = {
      id: uuidv4(),
      operatorId,
      typeOfWork,
      description: description || '',
      beforeImage: `/uploads/${req.files.beforeImage[0].filename}`,
      afterImage: `/uploads/${req.files.afterImage[0].filename}`,
      hoursWorked: parseFloat(hoursWorked),
      userRating: parseFloat(userRating) || 0,
      createdAt: new Date().toISOString()
    };

    const createdPost = createPost(post);
    res.status(201).json({ success: true, post: createdPost });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get all posts
router.get('/all', (req, res) => {
  try {
    const posts = getAllPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get posts by operator
router.get('/operator/:operatorId', (req, res) => {
  try {
    const { operatorId } = req.params;
    const posts = getPostsByOperator(operatorId);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete a post
router.delete('/:postId', (req, res) => {
  try {
    const { postId } = req.params;
    deletePost(postId);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update a post
router.put('/:postId', (req, res) => {
  try {
    const { postId } = req.params;
    const { typeOfWork, hoursWorked, userRating, description } = req.body;
    
    const updatedPost = updatePost(postId, {
      typeOfWork,
      hoursWorked: parseFloat(hoursWorked),
      userRating: parseFloat(userRating),
      description
    });

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true, post: updatedPost });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
