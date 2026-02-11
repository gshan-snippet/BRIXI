import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAllUserData, createUserData, updateUserData, deleteUserData } from '../database/db.js';

const router = express.Router();

// Get all user data entries
router.get('/', (req, res) => {
  try {
    const entries = getAllUserData();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Create a new user data entry
router.post('/', (req, res) => {
  try {
    const {
      username,
      phoneNumber,
      location,
      typeOfWork,
      serviceCharge,
      materialCosts,
      totalFees,
      profitMargin
    } = req.body;

    if (!username || !phoneNumber || !location || !typeOfWork) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const entry = {
      id: uuidv4(),
      username,
      phoneNumber,
      location,
      typeOfWork,
      serviceCharge: parseFloat(serviceCharge) || 0,
      materialCosts: parseFloat(materialCosts) || 0,
      totalFees: parseFloat(totalFees) || 0,
      profitMargin: parseFloat(profitMargin) || 0,
      createdAt: new Date().toISOString()
    };

    const created = createUserData(entry);
    res.status(201).json({ success: true, entry: created });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update an entry
router.put('/:entryId', (req, res) => {
  try {
    const { entryId } = req.params;
    const {
      username,
      phoneNumber,
      location,
      typeOfWork,
      serviceCharge,
      materialCosts,
      totalFees,
      profitMargin
    } = req.body;

    const updated = updateUserData(entryId, {
      username,
      phoneNumber,
      location,
      typeOfWork,
      serviceCharge: parseFloat(serviceCharge) || 0,
      materialCosts: parseFloat(materialCosts) || 0,
      totalFees: parseFloat(totalFees) || 0,
      profitMargin: parseFloat(profitMargin) || 0
    });

    if (!updated) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ success: true, entry: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete an entry
router.delete('/:entryId', (req, res) => {
  try {
    const { entryId } = req.params;
    deleteUserData(entryId);
    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
