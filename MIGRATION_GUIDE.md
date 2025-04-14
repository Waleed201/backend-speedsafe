# MongoDB Migration Guide: Local to Atlas

This guide will help you migrate your local MongoDB database to MongoDB Atlas.

## Prerequisites

1. MongoDB Database Tools installed on your system
   - Download from: https://www.mongodb.com/try/download/database-tools
   - Make sure `mongodump` and `mongorestore` are available in your system PATH

2. Local MongoDB running with your SpeedSafe data
3. MongoDB Atlas account and cluster set up

## Automatic Migration

We've created a script to automate the migration process:

1. Install the required dependencies:
   ```
   npm install
   ```

2. Make sure your .env file contains the correct MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://speedsafe:ze8EEOMhiPz7yyiL@speedsafe.idwcm9h.mongodb.net/?retryWrites=true&w=majority&appName=speedsafe
   ```

3. Run the migration script:
   ```
   node migrate-to-atlas.js
   ```

4. The script will:
   - Dump your local database to a temporary folder
   - Upload the data to MongoDB Atlas
   - Clean up temporary files

## Manual Migration

If you prefer to migrate manually or encounter issues with the script:

### Step 1: Dump Local Database

```bash
mongodump --db speedsafe --out ./db-dump
```

### Step 2: Restore to MongoDB Atlas

```bash
mongorestore --uri="mongodb+srv://speedsafe:ze8EEOMhiPz7yyiL@speedsafe.idwcm9h.mongodb.net/?retryWrites=true&w=majority&appName=speedsafe" --db=speedsafe ./db-dump/speedsafe
```

## Verifying Migration

After migration, you can verify your data has been properly migrated by:

1. Running your application with the new connection string
2. Using MongoDB Compass or the Atlas web interface to view your collections
3. Testing key API endpoints to ensure data can be accessed correctly

## After Migration

Once migration is complete and verified:

1. Update your application to use the Atlas connection string permanently
2. Update other environment variables for production (NODE_ENV, JWT_SECRET, etc.)
3. Install the new security dependencies added to package.json:
   ```
   npm install helmet compression express-rate-limit
   ```

## Troubleshooting

If you encounter issues during migration:

- Check MongoDB logs for specific error messages
- Ensure your IP address is whitelisted in MongoDB Atlas
  - Go to Atlas dashboard → Network Access → Add IP Address
  - You can add your current IP or temporarily allow access from anywhere (0.0.0.0/0)
- Verify network connectivity to MongoDB Atlas
- Make sure your MongoDB Atlas user has the correct permissions
- If you see "don't know what to do with file" errors, check the mongorestore command format

For further assistance, contact your system administrator or MongoDB Atlas support. 