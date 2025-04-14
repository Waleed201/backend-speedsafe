const express = require('express');
const router = express.Router();
const { 
  createContact, 
  getContacts, 
  getContactById, 
  markContactAsRead, 
  deleteContact 
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route for contact form submission
router.post('/', createContact);

// Protected routes (admin only)
router.get('/', protect, admin, getContacts);
router.get('/:id', protect, admin, getContactById);
router.put('/:id/read', protect, admin, markContactAsRead);
router.delete('/:id', protect, admin, deleteContact);

module.exports = router; 