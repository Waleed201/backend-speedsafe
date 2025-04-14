const express = require('express');
const router = express.Router();
const { 
  getServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService,
  deleteServiceImage,
  getServiceCatalog,
  downloadServiceCatalog,
  deleteServiceCatalog
} = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, handleUploadErrors } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);
router.get('/:id/catalog', getServiceCatalog);
router.get('/:id/catalog/download', downloadServiceCatalog);

// Protected routes (admin only)
router.post('/', protect, admin, upload, handleUploadErrors, createService);
router.put('/:id', protect, admin, upload, handleUploadErrors, updateService);
router.delete('/:id', protect, admin, deleteService);
router.delete('/:id/images/:imageId', protect, admin, deleteServiceImage);
router.delete('/:id/catalog', protect, admin, deleteServiceCatalog);

module.exports = router; 