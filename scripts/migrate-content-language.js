/**
 * Migration script to add language field to existing content documents
 * 
 * Run this script once after updating the contentModel schema
 * Usage: node scripts/migrate-content-language.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import the Content model directly using require
// Note: This assumes the model is already registered with mongoose
const Content = require('../src/models/contentModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for migration'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function migrateContentLanguage() {
  try {
    console.log('Starting content language migration...');
    
    // Find all content documents that don't have a language field
    const contentWithoutLanguage = await mongoose.connection.db.collection('contents').find({
      language: { $exists: false }
    }).toArray();
    
    console.log(`Found ${contentWithoutLanguage.length} content documents without language field`);
    
    if (contentWithoutLanguage.length === 0) {
      console.log('No migration needed. All documents already have language field.');
      process.exit(0);
    }
    
    // Update each document to add the language field with default value 'EN'
    for (const doc of contentWithoutLanguage) {
      console.log(`Updating content: ${doc.contentType}`);
      
      await mongoose.connection.db.collection('contents').updateOne(
        { _id: doc._id },
        { $set: { language: 'EN' } }
      );
    }
    
    console.log('Migration completed successfully!');
    console.log(`${contentWithoutLanguage.length} documents updated with language='EN'`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateContentLanguage(); 