const asyncHandler = require('express-async-handler');
const Content = require('../models/contentModel');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Get content by type and language
 * @route   GET /api/content/:type
 * @access  Public
 */
const getContentByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const language = req.query.lang || 'EN'; // Default to English if not specified
  
  if (!type || !['home', 'about', 'services', 'products', 'partners', 'gallery', 'contact', 'footer'].includes(type)) {
    res.status(400);
    throw new Error('Invalid content type');
  }
  
  if (!['EN', 'AR'].includes(language)) {
    res.status(400);
    throw new Error('Invalid language. Must be either EN or AR');
  }
  
  // Try to fetch from database first with language
  let content = await Content.findOne({ contentType: type, language });
  
  // If not found with language, try to find old content without language field
  // This is a fallback for backward compatibility
  if (!content) {
    content = await Content.findOne({ contentType: type, language: { $exists: false } });
    
    // If we found old content without language, update it to add the language field
    if (content) {
      console.log(`Found legacy content for ${type} without language field. Adding language: ${language}`);
      content.language = language;
      await content.save();
    }
  }
  
  // If still not found, load from JSON file and save to database
  if (!content) {
    try {
      // First try language-specific JSON file
      let jsonPath = path.join(process.cwd(), 'content', `${type}Content_${language}.json`);
      
      // If language-specific file doesn't exist, fall back to default
      if (!fs.existsSync(jsonPath)) {
        jsonPath = path.join(process.cwd(), 'content', `${type}Content.json`);
      }
      
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      content = await Content.create({
        contentType: type,
        language,
        data: jsonData
      });
      
    } catch (error) {
      res.status(500);
      throw new Error(`Error loading ${type} content in ${language}: ${error.message}`);
    }
  }
  
  res.json(content.data);
});

/**
 * @desc    Update content by type and language
 * @route   PUT /api/content/:type
 * @access  Private/Admin
 */
const updateContentByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { data, language = 'EN' } = req.body;
  
  if (!type || !['home', 'about', 'services', 'products', 'partners', 'gallery', 'contact', 'footer'].includes(type)) {
    res.status(400);
    throw new Error('Invalid content type');
  }
  
  if (!['EN', 'AR'].includes(language)) {
    res.status(400);
    throw new Error('Invalid language. Must be either EN or AR');
  }
  
  if (!data || Object.keys(data).length === 0) {
    res.status(400);
    throw new Error('No data provided for update');
  }
  
  let content = await Content.findOne({ contentType: type, language });
  
  if (!content) {
    content = new Content({
      contentType: type,
      language,
      data
    });
  } else {
    content.data = data;
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
  const contentTypes = ['home', 'about', 'services', 'products', 'partners', 'gallery', 'contact', 'footer'];
  const languages = ['EN', 'AR'];
  const results = [];
  
  for (const type of contentTypes) {
    for (const language of languages) {
      try {
        // First try language-specific JSON file
        let jsonPath = path.join(process.cwd(), 'content', `${type}Content_${language}.json`);
        let jsonExists = fs.existsSync(jsonPath);
        
        // If language-specific file doesn't exist and this is Arabic, skip
        // For English, fall back to the default file
        if (!jsonExists) {
          if (language === 'AR') {
            results.push({ type, language, status: 'skipped - no language file' });
            continue;
          }
          jsonPath = path.join(process.cwd(), 'content', `${type}Content.json`);
          jsonExists = fs.existsSync(jsonPath);
        }
        
        if (jsonExists) {
          const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          
          // Check if content already exists
          let content = await Content.findOne({ contentType: type, language });
          
          if (!content) {
            content = await Content.create({
              contentType: type,
              language,
              data: jsonData
            });
            results.push({ type, language, status: 'created' });
          } else {
            results.push({ type, language, status: 'already exists' });
          }
        } else {
          results.push({ type, language, status: 'file not found' });
        }
      } catch (error) {
        results.push({ type, language, status: 'error', message: error.message });
      }
    }
  }
  
  res.json({
    message: 'Content initialization completed',
    results
  });
});

/**
 * @desc    Duplicate all English content to Arabic
 * @route   POST /api/content/duplicate-to-arabic
 * @access  Private/Admin
 */
// const duplicateToArabic = asyncHandler(async (req, res) => {
//   try {
//     // Find all English content
//     const englishContent = await Content.find({ language: 'EN' });
//     const results = [];

//     for (const content of englishContent) {
//       // Check if Arabic version already exists
//       const existingArabic = await Content.findOne({
//         contentType: content.contentType,
//         language: 'AR'
//       });

//       if (existingArabic) {
//         results.push({
//           type: content.contentType,
//           status: 'skipped - Arabic version already exists'
//         });
//         continue;
//       }

//       // Create new Arabic version
//       const arabicContent = new Content({
//         contentType: content.contentType,
//         language: 'AR',
//         data: content.data // Initially copy the same data
//       });

//       await arabicContent.save();
//       results.push({
//         type: content.contentType,
//         status: 'created'
//       });
//     }

//     res.json({
//       message: 'Content duplication completed',
//       results
//     });
//   } catch (error) {
//     res.status(500);
//     throw new Error(`Error duplicating content: ${error.message}`);
//   }
// });

module.exports = {
  getContentByType,
  updateContentByType,
  initializeContent
  // duplicateToArabic
}; 