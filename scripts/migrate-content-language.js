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

// Verify MongoDB URI is set
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set. Please check your .env file.');
  process.exit(1);
}

// Import the Content model directly using require
// Note: This assumes the model is already registered with mongoose
const Content = require('../src/models/contentModel');

async function migrateContentLanguage() {
  try {
    console.log('Starting content language migration...');
    
    // Get the actual collection name (Mongoose might pluralize it differently)
    const collections = await mongoose.connection.db.listCollections().toArray();
    const contentCollectionName = collections.find(coll => 
      coll.name === 'contents' || coll.name === 'content'
    )?.name;
    
    if (!contentCollectionName) {
      console.error('Could not find content collection in database. Available collections:');
      collections.forEach(coll => console.log(`- ${coll.name}`));
      throw new Error('Content collection not found');
    }
    
    console.log(`Found content collection: ${contentCollectionName}`);
    
    // Find all content documents that don't have a language field
    const contentWithoutLanguage = await mongoose.connection.db.collection(contentCollectionName).find({
      language: { $exists: false }
    }).toArray();
    
    console.log(`Found ${contentWithoutLanguage.length} content documents without language field`);
    
    if (contentWithoutLanguage.length === 0) {
      console.log('No migration needed. All documents already have language field.');
      return;
    }
    
    // Update each document to add the language field with default value 'EN'
    for (const doc of contentWithoutLanguage) {
      console.log(`Updating content: ${doc.contentType}`);
      
      await mongoose.connection.db.collection(contentCollectionName).updateOne(
        { _id: doc._id },
        { $set: { language: 'EN' } }
      );
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