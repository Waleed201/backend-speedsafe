require('dotenv').config();
const mongoose = require('mongoose');
const Content = require('../src/models/contentModel');
const path = require('path');

// Log the current working directory and .env file path
console.log('Current working directory:', process.cwd());
console.log('.env file path:', path.resolve(process.cwd(), '.env'));

// Check if MONGODB_URI is defined
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in environment variables');
  console.error('Please make sure you have a .env file in the backend directory with MONGODB_URI defined');
  process.exit(1);
}

const duplicateContent = async () => {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find all English content
    const englishContent = await Content.find({ language: 'EN' });
    console.log(`Found ${englishContent.length} English content entries`);

    const results = {
      created: [],
      skipped: [],
      errors: []
    };

    for (const content of englishContent) {
      try {
        // Check if Arabic version already exists
        const existingArabic = await Content.findOne({
          contentType: content.contentType,
          language: 'AR'
        });

        if (existingArabic) {
          console.log(`Skipping ${content.contentType} - Arabic version already exists`);
          results.skipped.push(content.contentType);
          continue;
        }

        // Create new Arabic version
        const arabicContent = new Content({
          contentType: content.contentType,
          language: 'AR',
          data: content.data // Initially copy the same data
        });

        await arabicContent.save();
        console.log(`Created Arabic version for ${content.contentType}`);
        results.created.push(content.contentType);
      } catch (error) {
        console.error(`Error processing ${content.contentType}:`, error.message);
        results.errors.push({
          type: content.contentType,
          error: error.message
        });
      }
    }

    console.log('\nDuplication Results:');
    console.log('Created:', results.created.length, 'entries:', results.created);
    console.log('Skipped:', results.skipped.length, 'entries:', results.skipped);
    if (results.errors.length > 0) {
      console.log('Errors:', results.errors.length, 'entries:', results.errors);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the script
duplicateContent(); 