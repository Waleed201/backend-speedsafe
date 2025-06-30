const Partner = require('../models/partnerModel');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Helper function to upload file to Cloudinary
const uploadFileToCloudinary = async (file, folderName) => {
  try {
    const result = await uploadToCloudinary(file.path, {
      folder: `speedsafe/${folderName}`,
      public_id: `${folderName}_${Date.now()}`,
      resource_type: 'image'
    });
    
    // Delete local file after upload
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    return result;
  } catch (error) {
    console.error(`Error uploading to Cloudinary (${folderName}):`, error);
    throw error;
  }
};

// @desc    Fetch all partners
// @route   GET /api/partners
// @access  Public
const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({});
    res.json(partners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single partner
// @route   GET /api/partners/:id
// @access  Public
const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    
    if (partner) {
      res.json(partner);
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a partner
// @route   POST /api/partners
// @access  Private/Admin
const createPartner = async (req, res) => {
  try {
    const { name, nameAr, description, website } = req.body;
    
    // Handle logo upload - check req.files.images instead of req.file
    if (!req.files || !req.files.images || !req.files.images.length) {
      return res.status(400).json({ message: 'Please upload a logo image' });
    }
    
    // Upload logo to Cloudinary
    const logoFile = req.files.images[0];
    const uploadResult = await uploadFileToCloudinary(logoFile, 'partners');
    
    const partner = new Partner({
      name,
      nameAr,
      description,
      website,
      logo: {
        path: uploadResult.url,
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      }
    });
    
    const createdPartner = await partner.save();
    res.status(201).json(createdPartner);
  } catch (error) {
    console.error('Partner creation error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a partner
// @route   PUT /api/partners/:id
// @access  Private/Admin
const updatePartner = async (req, res) => {
  try {
    const { name, nameAr, description, website } = req.body;
    
    const partner = await Partner.findById(req.params.id);
    
    if (partner) {
      partner.name = name || partner.name;
      partner.nameAr = nameAr !== undefined ? nameAr : partner.nameAr;
      partner.description = description || partner.description;
      partner.website = website || partner.website;
      
      // Handle logo upload
      if (req.files && req.files.images && req.files.images.length > 0) {
        try {
          // Delete old logo from Cloudinary if exists
          if (partner.logo && partner.logo.public_id) {
            try {
              await deleteFromCloudinary(partner.logo.public_id);
            } catch (deleteError) {
              console.error('Error deleting old logo:', deleteError);
              // Continue even if deletion fails
            }
          }
          
          // Upload new logo to Cloudinary
          const logoFile = req.files.images[0];
          const uploadResult = await uploadFileToCloudinary(logoFile, 'partners');
          
          // Update logo information
          partner.logo = {
            path: uploadResult.url,
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id
          };
        } catch (error) {
          console.error('Logo upload error during update:', error);
          // Continue updating partner even if logo upload fails
        }
      }
      
      const updatedPartner = await partner.save();
      res.json(updatedPartner);
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a partner
// @route   DELETE /api/partners/:id
// @access  Private/Admin
const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    
    if (partner) {
      // Delete logo from Cloudinary if exists
      if (partner.logo && partner.logo.public_id) {
        try {
          await deleteFromCloudinary(partner.logo.public_id);
          console.log('Successfully deleted logo from Cloudinary:', partner.logo.public_id);
        } catch (err) {
          console.error('Error deleting logo from Cloudinary:', err);
          // Continue with partner deletion even if logo deletion fails
        }
      }
      
      await partner.deleteOne();
      res.json({ message: 'Partner removed' });
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner
}; 