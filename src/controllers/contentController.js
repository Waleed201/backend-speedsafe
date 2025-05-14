const asyncHandler = require('express-async-handler');
const Content = require('../models/contentModel');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Get content by type
 * @route   GET /api/content/:type
 * @access  Public
 */
const getContentByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  
  if (!type || !['home', 'about', 'services', 'products', 'partners', 'gallery', 'contact'].includes(type)) {
    res.status(400);
    throw new Error('Invalid content type');
  }
  
  // Try to fetch from database first
  let content = await Content.findOne({ contentType: type });
  
  // If not in database, load from JSON file and save to database
  if (!content) {
    try {
      const jsonPath = path.join(process.cwd(), 'content', `${type}Content.json`);
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      content = await Content.create({
        contentType: type,
        data: jsonData
      });
      
    } catch (error) {
      res.status(500);
      throw new Error(`Error loading ${type} content: ${error.message}`);
    }
  }
  
  res.json(content.data);
});

/**
 * @desc    Update content by type
 * @route   PUT /api/content/:type
 * @access  Private/Admin
 */
const updateContentByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const newData = req.body;
  
  if (!type || !['home', 'about', 'services', 'products', 'partners', 'gallery', 'contact'].includes(type)) {
    res.status(400);
    throw new Error('Invalid content type');
  }
  
  if (!newData || Object.keys(newData).length === 0) {
    res.status(400);
    throw new Error('No data provided for update');
  }
  
  let content = await Content.findOne({ contentType: type });
  
  if (!content) {
    content = new Content({
      contentType: type,
      data: newData
    });
  } else {
    content.data = newData;
  }
  
  const updatedContent = await content.save();
  res.json(updatedContent.data);
});

/**
 * @desc    Initialize database with JSON content files
 * @route   POST /api/content/init
 * @access  Private/Admin
 */
const initializeContent = asyncHandler(async (req, res) => {
  const contentTypes = ['home', 'about', 'services', 'products', 'partners', 'gallery', 'contact'];
  const results = [];
  
  for (const type of contentTypes) {
    try {
      const jsonPath = path.join(process.cwd(), 'content', `${type}Content.json`);
      
      if (fs.existsSync(jsonPath)) {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        // Check if content already exists
        let content = await Content.findOne({ contentType: type });
        
        if (!content) {
          content = await Content.create({
            contentType: type,
            data: jsonData
          });
          results.push({ type, status: 'created' });
        } else {
          results.push({ type, status: 'already exists' });
        }
      } else {
        results.push({ type, status: 'file not found' });
      }
    } catch (error) {
      results.push({ type, status: 'error', message: error.message });
    }
  }
  
  res.json({
    message: 'Content initialization completed',
    results
  });
});

module.exports = {
  getContentByType,
  updateContentByType,
  initializeContent
}; 