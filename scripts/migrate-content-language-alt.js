/**
 * Alternative migration script to add language field to existing content documents
 * This version uses Mongoose models directly instead of the MongoDB driver
 * 
 * Run this script once after updating the contentModel schema
 * Usage: node scripts/migrate-content-language-alt.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Verify MongoDB URI is set
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set. Please check your .env file.');
  process.exit(1);
}

// Define a simplified Content schema for migration purposes
const contentSchema = mongoose.Schema(
  {
    contentType: String,
    language: String,
    data: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

// Create a model using the schema
const Content = mongoose.model('Content', contentSchema);

async function migrateContentLanguage() {
  try {
    console.log('Starting content language migration (alternative method)...');
    
    // Find all content documents that don't have a language field or where language is null
    const contentWithoutLanguage = await Content.find({
      $or: [
        { language: { $exists: false } },
        { language: null }
      ]
    });
    
    console.log(`Found ${contentWithoutLanguage.length} content documents without language field`);
    
    if (contentWithoutLanguage.length === 0) {
      console.log('No migration needed. All documents already have language field.');
      return;
    }
    
    // Update each document to add the language field with default value 'EN'
    for (const content of contentWithoutLanguage) {
      console.log(`Updating content: ${content.contentType}`);
      
      content.language = 'EN';
      await content.save();
    }
    
    console.log('Migration completed successfully!');
    console.log(`${contentWithoutLanguage.length} documents updated with language='EN'`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Connect to MongoDB and run migration only after connection is established
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected for migration');
    await migrateContentLanguage();
    console.log('Migration process complete. Disconnecting...');
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 