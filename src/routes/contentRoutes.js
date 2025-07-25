const express = require('express');
const { getContentByType, updateContentByType, initializeContent } = require('../controllers/contentController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes - can specify language with ?lang=EN or ?lang=AR
router.get('/:type', getContentByType);

// Admin only routes
router.put('/:type', protect, admin, updateContentByType);
router.post('/init', protect, admin, initializeContent);

module.exports = router; 