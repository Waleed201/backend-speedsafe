const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Load environment variables before importing any other config
dotenv.config();

// Import additional security packages - you'll need to install these:
// npm install helmet compression express-rate-limit
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Connect to database
connectDB();

// Initialize express
const app = express();

// Security middleware
// Apply helmet for security headers with custom CSP for images
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "localhost:5001"],
        "default-src": ["'self'", "localhost:5001"]
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002', 
    'http://localhost:3005', 
    'http://localhost:5173',
    'https://frontend-7xz95vgzp-waleed201s-projects.vercel.app',
    'https://speedsafe-frontend.vercel.app',
    'https://speedsafe.vercel.app',
    'https://speed-safe.vercel.app',
    'https://test.kfupm-yb.com',
    'https://admin.kfupm-yb.com',
    'https://*.vercel.app'  // This will allow all subdomains on vercel.app
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Compression for faster response
app.use(compression());

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Use a more concise format in production
  app.use(morgan('combined'));
}

// Ensure upload directories exist
const uploadDirectories = [
  path.join(__dirname, '../public/uploads'),
  path.join(__dirname, '../public/uploads/products'),
  path.join(__dirname, '../public/uploads/services'),
  path.join(__dirname, '../public/uploads/partners'),
  path.join(__dirname, '../public/uploads/catalogs')
];

uploadDirectories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Serve uploaded files - with security consideration
app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, path) => {
    // Set cache control for static assets
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Allow cross-origin access to images and other assets
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Remove content-type sniffing for security
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Set specific headers for uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  setHeaders: (res, path) => {
    // Set appropriate CORS headers specifically for images
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Cache control
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Set Content-Type explicitly for images based on extension
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/contact', contactRoutes);

// Debug route to check database connection
app.get('/debug/database', async (req, res) => {
  try {
    // Get database connection
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    // Get count for each collection
    const collectionData = await Promise.all(
      collections.map(async (collection) => {
        const count = await db.collection(collection.name).countDocuments();
        return {
          name: collection.name,
          count
        };
      })
    );
    
    // Return connection info and collections
    res.json({
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      collections: collectionData
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ 
      error: 'Database connection error',
      message: error.message
    });
  }
});

// Debug route to test image serving
app.get('/debug/image-test', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Image Test</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          img { max-width: 100%; border: 1px solid #ddd; margin: 10px 0; }
          .success { color: green; }
          .error { color: red; }
        </style>
      </head>
      <body>
        <h1>Image Serving Test</h1>
        <p>This page tests if images are being served correctly from your backend.</p>
        
        <h2>Test 1: Direct image references</h2>
        <div id="images-container">
          <p>Loading images...</p>
        </div>

        <script>
          // Fetch all products to get some image paths
          fetch('/api/products')
            .then(response => response.json())
            .then(products => {
              const container = document.getElementById('images-container');
              container.innerHTML = '';
              
              if (products && products.length > 0) {
                products.forEach(product => {
                  if (product.images && product.images.length > 0) {
                    const imgPath = product.images[0].path;
                    const fullImgUrl = imgPath.startsWith('/') ? imgPath : '/' + imgPath;
                    
                    const imgElement = document.createElement('div');
                    imgElement.innerHTML = \`
                      <h3>\${product.name}</h3>
                      <p>Image URL: \${fullImgUrl}</p>
                      <img src="\${fullImgUrl}" onload="this.parentNode.classList.add('success')" onerror="this.parentNode.classList.add('error')" />
                      <p class="status">Status: <span id="status-\${product._id}">Loading...</span></p>
                    \`;
                    
                    container.appendChild(imgElement);
                    
                    // Also try a fetch to see if we can get the image directly
                    fetch(fullImgUrl)
                      .then(response => {
                        if (response.ok) {
                          document.getElementById(\`status-\${product._id}\`).textContent = 'Image loaded successfully';
                          document.getElementById(\`status-\${product._id}\`).style.color = 'green';
                        } else {
                          document.getElementById(\`status-\${product._id}\`).textContent = \`Error: \${response.status} \${response.statusText}\`;
                          document.getElementById(\`status-\${product._id}\`).style.color = 'red';
                        }
                      })
                      .catch(error => {
                        document.getElementById(\`status-\${product._id}\`).textContent = \`Fetch error: \${error.message}\`;
                        document.getElementById(\`status-\${product._id}\`).style.color = 'red';
                      });
                  }
                });
              } else {
                container.innerHTML = '<p>No products with images found</p>';
              }
            })
            .catch(error => {
              document.getElementById('images-container').innerHTML = \`<p class="error">Error fetching products: \${error.message}</p>\`;
            });
        </script>
      </body>
    </html>
  `);
});

// Debug route to check admin users
app.get('/debug/admin-users', async (req, res) => {
  try {
    // Get all admin users (without returning passwords)
    const adminUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    
    // Return sanitized user data (remove password)
    const sanitizedUsers = adminUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json({
      count: sanitizedUsers.length,
      users: sanitizedUsers
    });
  } catch (error) {
    console.error('Debug admin users error:', error);
    res.status(500).json({ 
      error: 'Database query error',
      message: error.message
    });
  }
});

// Debug route for testing auth
app.get('/debug/auth-test', async (req, res) => {
  try {
    const User = mongoose.model('User');
    const testEmail = 'admin@speedsafe.com';
    
    // Find user by email
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      return res.json({ 
        status: 'error',
        message: 'Test user not found',
        solution: 'Run the seeder script to create admin user'
      });
    }
    
    // Test a known password (DO NOT USE IN PRODUCTION)
    const passwordTest = await user.matchPassword('admin123');
    
    res.json({
      status: 'success',
      userFound: !!user,
      email: user.email,
      passwordMatches: passwordTest,
      suggestion: passwordTest ? 
        'Login should work with email: admin@speedsafe.com, password: admin123' : 
        'Password does not match, try running seeder script again'
    });
  } catch (error) {
    console.error('Auth test error:', error);
    res.status(500).json({ 
      error: 'Authentication test failed',
      message: error.message
    });
  }
});

// Debug route for testing login form
app.get('/debug/login-test', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Login Test</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; }
          .form-group { margin-bottom: 15px; }
          label { display: block; margin-bottom: 5px; }
          input { width: 100%; padding: 8px; box-sizing: border-box; }
          button { padding: 10px 15px; background: #007bff; color: white; border: none; cursor: pointer; }
          .result { margin-top: 20px; padding: 15px; border: 1px solid #ddd; display: none; }
          .success { background-color: #d4edda; color: #155724; }
          .error { background-color: #f8d7da; color: #721c24; }
          pre { white-space: pre-wrap; overflow-wrap: break-word; }
        </style>
      </head>
      <body>
        <h1>Login Test Form</h1>
        <p>Use this form to test direct login to the API.</p>
        
        <div class="form-group">
          <label for="email">Email Address:</label>
          <input type="email" id="email" value="admin@speedsafe.com" placeholder="Enter email">
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" value="admin123" placeholder="Enter password">
        </div>
        
        <button id="login-btn">Test Login</button>
        
        <div id="result" class="result">
          <h3>Response:</h3>
          <pre id="response-data"></pre>
        </div>
        
        <script>
          document.getElementById('login-btn').addEventListener('click', async () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const resultDiv = document.getElementById('result');
            const responseData = document.getElementById('response-data');
            
            try {
              const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
              });
              
              const data = await response.json();
              
              resultDiv.style.display = 'block';
              if (response.ok) {
                resultDiv.className = 'result success';
                responseData.textContent = JSON.stringify(data, null, 2);
              } else {
                resultDiv.className = 'result error';
                responseData.textContent = JSON.stringify(data, null, 2);
              }
            } catch (error) {
              resultDiv.style.display = 'block';
              resultDiv.className = 'result error';
              responseData.textContent = 'Error: ' + error.message;
            }
          });
        </script>
      </body>
    </html>
  `);
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('SpeedSafe API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// 404 handler - must be after all routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 