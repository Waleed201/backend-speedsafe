const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

// Create admin user
const createAdminUser = async () => {
  try {
    // Clear existing users
    await User.deleteMany();
    
    // Create admin user
    const adminUser = {
      name: 'Admin User',
      email: 'admin@speedsafe.com',
      password: 'admin123',
      isAdmin: true
    };
    
    await User.create(adminUser);
    
    console.log('Admin user created');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
createAdminUser(); 