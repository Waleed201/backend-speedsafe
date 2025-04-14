const express = require('express');
const router = express.Router();
const { 
  authUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Auth routes
router.post('/login', authUser);
router.post('/', protect, admin, registerUser); // Only admins can create new users
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router; 