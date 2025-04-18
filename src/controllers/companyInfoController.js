const asyncHandler = require('express-async-handler');
const CompanyInfo = require('../models/companyInfo');

/**
 * @desc    Get company information
 * @route   GET /api/company-info
 * @access  Public
 */
const getCompanyInfo = asyncHandler(async (req, res) => {
  const companyInfo = await CompanyInfo.findOneOrCreate();
  
  if (companyInfo) {
    res.json(companyInfo);
  } else {
    res.status(404);
    throw new Error('Company information not found');
  }
});

/**
 * @desc    Update company information
 * @route   PUT /api/company-info
 * @access  Private/Admin
 */
const updateCompanyInfo = asyncHandler(async (req, res) => {
  let companyInfo = await CompanyInfo.findOne();
  
  if (!companyInfo) {
    companyInfo = new CompanyInfo({});
  }
  
  // Update the fields from request body
  const {
    address,
    phone,
    email,
    businessHours,
    socialMedia
  } = req.body;
  
  // Update address if provided
  if (address) {
    companyInfo.address.street = address.street || companyInfo.address.street;
    companyInfo.address.suite = address.suite || companyInfo.address.suite;
    companyInfo.address.city = address.city || companyInfo.address.city;
    companyInfo.address.country = address.country || companyInfo.address.country;
  }
  
  // Update phone if provided
  if (phone) {
    companyInfo.phone.main = phone.main || companyInfo.phone.main;
    companyInfo.phone.support = phone.support || companyInfo.phone.support;
  }
  
  // Update email if provided
  if (email) {
    companyInfo.email.general = email.general || companyInfo.email.general;
    companyInfo.email.sales = email.sales || companyInfo.email.sales;
    companyInfo.email.support = email.support || companyInfo.email.support;
  }
  
  // Update business hours if provided
  if (businessHours) {
    companyInfo.businessHours.weekdays = businessHours.weekdays || companyInfo.businessHours.weekdays;
    companyInfo.businessHours.weekend = businessHours.weekend || companyInfo.businessHours.weekend;
  }
  
  // Update social media if provided
  if (socialMedia) {
    companyInfo.socialMedia.facebook = socialMedia.facebook || companyInfo.socialMedia.facebook;
    companyInfo.socialMedia.twitter = socialMedia.twitter || companyInfo.socialMedia.twitter;
    companyInfo.socialMedia.instagram = socialMedia.instagram || companyInfo.socialMedia.instagram;
    companyInfo.socialMedia.linkedin = socialMedia.linkedin || companyInfo.socialMedia.linkedin;
  }
  
  const updatedCompanyInfo = await companyInfo.save();
  res.json(updatedCompanyInfo);
});

module.exports = {
  getCompanyInfo,
  updateCompanyInfo
}; 