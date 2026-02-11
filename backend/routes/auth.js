import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, createUser, getAllUsers } from '../database/db.js';

const router = express.Router();

// Login route
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = getUserByEmail(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Register route (for consumers only)
router.post('/register', (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = {
      id: uuidv4(),
      email,
      password, // In production, this should be hashed
      name,
      phone: phone || '',
      role: 'consumer',
      createdAt: new Date().toISOString()
    };

    const createdUser = createUser(newUser);
    const { password: _, ...userWithoutPassword } = createdUser;
    
    res.status(201).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get all users (for testing/admin purposes)
router.get('/users', (req, res) => {
  try {
    const users = getAllUsers();
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
