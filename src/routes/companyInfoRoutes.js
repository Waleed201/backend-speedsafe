const express = require('express');
const router = express.Router();
const { getCompanyInfo, updateCompanyInfo, uploadLogo } = require('../controllers/companyInfoController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, handleUploadErrors } = require('../middleware/uploadMiddleware');

// Public route to get company info
router.route('/').get(getCompanyInfo);

// Admin protected route to update company info
router.route('/').put(protect, admin, updateCompanyInfo);

// Admin protected route to upload company logo
router.route('/logo').post(protect, admin, upload, handleUploadErrors, uploadLogo);

module.exports = router;