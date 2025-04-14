const express = require('express');
const router = express.Router();
const { 
  getPartners, 
  getPartnerById, 
  createPartner, 
  updatePartner, 
  deletePartner 
} = require('../controllers/partnerController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, handleUploadErrors } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getPartners);
router.get('/:id', getPartnerById);

// Protected routes (admin only)
router.post('/', protect, admin, upload, handleUploadErrors, createPartner);
router.put('/:id', protect, admin, upload, handleUploadErrors, updatePartner);
router.delete('/:id', protect, admin, deletePartner);

module.exports = router; 