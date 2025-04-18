const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../models/userModel');
const CompanyInfo = require('../models/companyInfo');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const seedData = async () => {
  try {
    console.log('Starting seeder...'.yellow.bold);

    // Clear existing data if needed
    // await User.deleteMany();
    console.log('Data cleared...'.red.inverse);

    // Create admin user if it doesn't exist
    const adminEmail = 'admin@speedsafe.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123',
        isAdmin: true
      });
      console.log('Admin user created'.green.inverse);
    } else {
      console.log('Admin user already exists'.blue);
    }

    // Create or update company information
    const companyInfo = await CompanyInfo.findOne();
    
    if (!companyInfo) {
      await CompanyInfo.create({
        address: {
          street: '123 Security Avenue',
          suite: 'Suite 500',
          city: 'Riyadh',
          country: 'Saudi Arabia'
        },
        phone: {
          main: '+966 558 128 XXX',
          support: '+966 558 128 XXX'
        },
        email: {
          general: 'info@speedsafe.com',
          sales: 'sales@speedsafe.com',
          support: 'support@speedsafe.com'
        },
        businessHours: {
          weekdays: 'Sunday - Thursday: 9:00 AM - 6:00 PM',
          weekend: 'Friday - Saturday: Closed'
        }
      });
      console.log('Company information created'.green.inverse);
    } else {
      console.log('Company information already exists'.blue);
    }

    console.log('Seeder finished successfully'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Run the seeder
seedData();