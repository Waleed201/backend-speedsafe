const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log the connection string (with credentials partially hidden for security)
    const connectionString = process.env.MONGODB_URI || '';
    const redactedUri = connectionString ? 
      connectionString.replace(/(mongodb\+srv:\/\/[^:]+):([^@]+)@/, '$1:****@') : 
      'undefined';
    
    console.log(`Attempting to connect to MongoDB with URI: ${redactedUri}`);
    
    // Connection string with fallback for deployment
    const mongoUri = process.env.MONGODB_URI || 
      "mongodb+srv://speedsafe:ze8EEOMhiPz7yyiL@speedsafe.idwcm9h.mongodb.net/speedsafe?retryWrites=true&w=majority&appName=speedsafe";
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Full error:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 