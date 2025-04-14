const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  // Fallback JWT secret in case environment variable is not set
  const jwtSecret = process.env.JWT_SECRET || 'FLRt4$p!Yd7#eEDsafeGxA9&2qZ5*bCnW3@jKvQ8mHpVU6';
  
  // Log some debug info (will only show in development or when debugging)
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET environment variable is not set - using fallback secret. This is not secure for production!');
    console.log('Available environment variables:', Object.keys(process.env).join(', '));
  }
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required for authentication');
  }
  
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d' // Token valid for 30 days
  });
};

module.exports = generateToken; 