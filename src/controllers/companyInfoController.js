const asyncHandler = require('express-async-handler');
const CompanyInfo = require('../models/companyInfo');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

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
    logo,
    address,
    phone,
    email,
    businessHours,
    socialMedia,
    themeColor
  } = req.body;
  
  // Update logo if provided
  if (logo) {
    companyInfo.logo.path = logo.path || companyInfo.logo.path;
    companyInfo.logo.altText = logo.altText || companyInfo.logo.altText;
    
    // Add Cloudinary-specific fields if provided
    if (logo.public_id) {
      companyInfo.logo.public_id = logo.public_id;
    }
    if (logo.secure_url) {
      companyInfo.logo.secure_url = logo.secure_url;
    }
  }
  
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
  
  // Update themeColor if provided
  if (themeColor) {
    companyInfo.themeColor = themeColor;
  }
  
  const updatedCompanyInfo = await companyInfo.save();
  res.json(updatedCompanyInfo);
});

/**
 * @desc    Upload company logo to Cloudinary
 * @route   POST /api/company-info/logo
 * @access  Private/Admin
 */
const uploadLogo = asyncHandler(async (req, res) => {
  // Check if files were uploaded
  if (!req.files || !req.files.logo) {
    res.status(400);
    throw new Error('No logo file uploaded');
  }

  const logoFile = req.files.logo[0];
  
  try {
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(logoFile.path, {
      folder: 'speedsafe/company',
      public_id: `company_logo_${Date.now()}`,
      overwrite: true,
      resource_type: 'image'
    });
    
    console.log('Cloudinary upload result:', uploadResult);
    
    // Find and update company info with new logo data
    let companyInfo = await CompanyInfo.findOne();
    
    if (!companyInfo) {
      companyInfo = new CompanyInfo({});
    }
    
    // Delete old logo from Cloudinary if exists
    if (companyInfo.logo && companyInfo.logo.public_id) {
      try {
        await deleteFromCloudinary(companyInfo.logo.public_id);
        console.log('Old logo deleted from Cloudinary');
      } catch (deleteError) {
        console.error('Error deleting old logo:', deleteError);
        // Continue with the update even if deletion fails
      }
    }
    
    // Update logo information
    companyInfo.logo = {
      path: uploadResult.url,
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      altText: req.body.altText || 'Company Logo'
    };
    
    // Save updated company info
    await companyInfo.save();
    
    // Remove temporary file after uploading to Cloudinary
    fs.unlinkSync(logoFile.path);
    
    res.status(200).json({ 
      message: 'Logo uploaded successfully to Cloudinary',
      logo: companyInfo.logo
    });
  } catch (error) {
    console.error('Error in logo upload:', error);
    
    // Remove temporary file in case of error
    if (fs.existsSync(logoFile.path)) {
      fs.unlinkSync(logoFile.path);
    }
    
    res.status(500);
    throw new Error(`Logo upload failed: ${error.message}`);
  }
});

module.exports = {
  getCompanyInfo,
  updateCompanyInfo,
  uploadLogo
}; 