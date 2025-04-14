/**
 * Database Migration Script from Local MongoDB to MongoDB Atlas
 * 
 * This script helps migrate your local MongoDB data to MongoDB Atlas
 * Requirements:
 * 1. MongoDB Database Tools installed (mongodump, mongorestore)
 * 2. Both local MongoDB and MongoDB Atlas connection available
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create dump directory if it doesn't exist
const dumpDir = path.join(__dirname, 'db-dump');
if (!fs.existsSync(dumpDir)) {
  fs.mkdirSync(dumpDir, { recursive: true });
}

// Database name
const dbName = 'speedsafe';

// Step 1: Dump local database
console.log('Step 1: Dumping local database...');
const mongodumpCmd = `mongodump --db ${dbName} --out ${dumpDir}`;

exec(mongodumpCmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error dumping local database: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`mongodump stderr: ${stderr}`);
  }
  
  console.log(`Local database successfully dumped to ${dumpDir}`);
  console.log('Step 1 completed.');
  
  // Step 2: Restore to MongoDB Atlas
  console.log('\nStep 2: Restoring to MongoDB Atlas...');
  console.log('This may take a few minutes depending on the size of your database.');
  
  // Get MongoDB Atlas URI from environment variables
  const atlasUri = process.env.MONGODB_URI;
  
  if (!atlasUri) {
    console.error('MongoDB Atlas URI not found in .env file.');
    return;
  }
  
  // The correct mongorestore command format
  const mongorestoreCmd = `mongorestore --uri="${atlasUri}" --db=${dbName} ${path.join(dumpDir, dbName)}`;
  
  exec(mongorestoreCmd, (restoreError, restoreStdout, restoreStderr) => {
    if (restoreError) {
      console.error(`Error restoring to MongoDB Atlas: ${restoreError.message}`);
      return;
    }
    
    if (restoreStderr) {
      console.log(`mongorestore stderr: ${restoreStderr}`);
    }
    
    console.log('Database successfully restored to MongoDB Atlas.');
    console.log('Step 2 completed.');
    console.log('\nMigration completed successfully!');
    
    // Clean up
    console.log('\nCleaning up temporary files...');
    try {
      // Use fs.rm instead of fs.rmdir to avoid deprecation warning
      fs.rmSync(dumpDir, { recursive: true, force: true });
      console.log('Temporary files removed.');
    } catch (err) {
      console.error(`Error removing temporary files: ${err.message}`);
    }
  });
}); 