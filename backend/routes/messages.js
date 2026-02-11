import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createMessage, getMessages, getConversation, createAppointment, deleteConversation } from '../database/db.js';

const router = express.Router();

// Send a regular message from user/operator
router.post('/send', (req, res) => {
  try {
    const { operatorId, userId, userName, messageText, senderRole } = req.body;

    if (!operatorId || !userId || !messageText || !senderRole) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = {
      id: uuidv4(),
      operatorId,
      userId,
      userName,
      messageText,
      senderRole, // 'consumer' or 'operator'
      type: 'message',
      createdAt: new Date().toISOString()
    };

    const createdMessage = createMessage(message);
    res.status(201).json({ success: true, message: createdMessage });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Send appointment request (appears as a special message in operator inbox)
router.post('/appointment', (req, res) => {
  try {
    const { operatorId, userId, userName, userPhone, appointmentDate, location, workingHours, typeOfWork } = req.body;

    if (!operatorId || !userId || !appointmentDate || !location || !workingHours || !typeOfWork) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const appointmentMessage = {
      id: uuidv4(),
      operatorId,
      userId,
      userName,
      userPhone: userPhone || '',
      appointmentDate,
      location,
      workingHours,
      typeOfWork,
      type: 'appointment',
      senderRole: 'consumer',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Create appointment message
    const createdMessage = createMessage(appointmentMessage);
    
    // Also save to appointments table
    createAppointment(appointmentMessage);

    res.status(201).json({ success: true, message: createdMessage });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get all messages for operator (grouped by user)
router.get('/operator/:operatorId', (req, res) => {
  try {
    const { operatorId } = req.params;
    const messages = getMessages(operatorId);
    
    // Group messages by userId with user info
    const grouped = {};
    messages.forEach(msg => {
      if (!grouped[msg.userId]) {
        // Find the consumer's actual name by looking for consumer messages
        let consumerName = msg.userName;
        if (msg.senderRole === 'operator') {
          // If this is an operator message, find a consumer message to get the real consumer name
          const consumerMsg = messages.find(m => m.userId === msg.userId && m.senderRole === 'consumer');
          if (consumerMsg) {
            consumerName = consumerMsg.userName;
          }
        }
        
        grouped[msg.userId] = {
          userId: msg.userId,
          userName: consumerName,
          userPhone: msg.userPhone,
          lastMessage: msg,
          messages: []
        };
      }
      grouped[msg.userId].messages.push(msg);
    });

    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get conversation between operator and specific user
router.get('/conversation/:operatorId/:userId', (req, res) => {
  try {
    const { operatorId, userId } = req.params;
    const conversation = getConversation(operatorId, userId);
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete conversation between operator and specific user
router.delete('/conversation/:operatorId/:userId', (req, res) => {
  try {
    const { operatorId, userId } = req.params;
    deleteConversation(operatorId, userId);
    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
