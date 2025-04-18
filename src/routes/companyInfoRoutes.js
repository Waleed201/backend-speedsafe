const express = require('express');
const router = express.Router();
const { getCompanyInfo, updateCompanyInfo } = require('../controllers/companyInfoController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to get company info
router.route('/').get(getCompanyInfo);

// Admin protected route to update company info
router.route('/').put(protect, admin, updateCompanyInfo);

module.exports = router;