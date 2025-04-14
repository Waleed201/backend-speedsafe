const Partner = require('../models/partnerModel');
const fs = require('fs');
const path = require('path');

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
    const { name, description, website } = req.body;
    
    // Handle logo upload - check req.files.images instead of req.file
    if (!req.files || !req.files.images || !req.files.images.length) {
      return res.status(400).json({ message: 'Please upload a logo image' });
    }
    
    const logoPath = `/uploads/partners/${path.basename(req.files.images[0].path)}`;
    
    const partner = new Partner({
      name,
      description,
      website,
      logo: logoPath
    });
    
    const createdPartner = await partner.save();
    res.status(201).json(createdPartner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a partner
// @route   PUT /api/partners/:id
// @access  Private/Admin
const updatePartner = async (req, res) => {
  try {
    const { name, description, website } = req.body;
    
    const partner = await Partner.findById(req.params.id);
    
    if (partner) {
      partner.name = name || partner.name;
      partner.description = description || partner.description;
      partner.website = website || partner.website;
      
      // Handle logo upload
      if (req.file) {
        // Remove old logo if exists
        const oldLogoPath = path.join(__dirname, '../../', partner.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
        
        // Add new logo
        partner.logo = `/uploads/partners/${path.basename(req.file.path)}`;
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
      // Delete logo file
      const logoPath = path.join(__dirname, '../../', partner.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
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