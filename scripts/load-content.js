const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import the content model
const Content = require('../src/models/contentModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Content types to load
const contentTypes = ['home', 'about', 'services', 'products', 'partners', 'gallery', 'contact'];

// Function to load content
async function loadContent() {
  console.log('Starting content loading process...');
  
  for (const type of contentTypes) {
    try {
      console.log(`Processing ${type} content...`);
      const jsonPath = path.join(__dirname, '../content', `${type}Content.json`);
      
      if (fs.existsSync(jsonPath)) {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        // Check if content already exists
        const existingContent = await Content.findOne({ contentType: type });
        
        if (existingContent) {
          console.log(`Content for ${type} already exists. Updating...`);
          existingContent.data = jsonData;
          await existingContent.save();
          console.log(`Content for ${type} updated successfully.`);
        } else {
          console.log(`Creating new content for ${type}...`);
          await Content.create({
            contentType: type,
            data: jsonData
          });
          console.log(`Content for ${type} created successfully.`);
        }
      } else {
        console.log(`WARNING: ${jsonPath} file not found.`);
      }
    } catch (error) {
      console.error(`Error processing ${type} content:`, error);
    }
  }
  
  console.log('Content loading process completed.');
  mongoose.disconnect();
}

// Run the content loading function
loadContent(); 