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
const companyInfoRoutes = require('./routes/companyInfoRoutes');
const contentRoutes = require('./routes/contentRoutes');

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
  path.join(__dirname, '../public/uploads/catalogs'),
  path.join(__dirname, '../public/uploads/company')
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
app.use('/api/company-info', companyInfoRoutes);
app.use('/api/content', contentRoutes);

// Add a health check endpoint for deployment platforms
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SpeedSafe API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

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
// app.get('/debug/image-test', (req, res) => {
//   res.send(`
//     <html>
//       <head>
//         <title>Image Test</title>
//         <style>
//           body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
//           img { max-width: 100%; border: 1px solid #ddd; margin: 10px 0; }
//           .success { color: green; }
//           .error { color: red; }
//         </style>
//       </head>
//       <body>
//         <h1>Image Serving Test</h1>
//         <p>This page tests if images are being served correctly from your backend.</p>
        
//         <h2>Test 1: Direct image references</h2>
//         <div id="images-container">
//           <p>Loading images...</p>
//         </div>

//         <script>
//           // Fetch all products to get some image paths
//           fetch('/api/products')
//             .then(response => response.json())
//             .then(products => {
//               const container = document.getElementById('images-container');
//               container.innerHTML = '';
              
//               if (products && products.length > 0) {
//                 products.forEach(product => {
//                   if (product.images && product.images.length > 0) {
//                     const imgPath = product.images[0].path;
//                     const fullImgUrl = imgPath.startsWith('/') ? imgPath : '/' + imgPath;
                    
//                     const imgElement = document.createElement('div');
//                     imgElement.innerHTML = \`
//                       <h3>\${product.name}</h3>
//                       <p>Image URL: \${fullImgUrl}</p>
//                       <img src="\${fullImgUrl}" onload="this.parentNode.classList.add('success')" onerror="this.parentNode.classList.add('error')" />
//                       <p class="status">Status: <span id="status-\${product._id}">Loading...</span></p>
//                     \`;
                    
//                     container.appendChild(imgElement);
                    
//                     // Also try a fetch to see if we can get the image directly
//                     fetch(fullImgUrl)
//                       .then(response => {
//                         if (response.ok) {
//                           document.getElementById(\`status-\${product._id}\`).textContent = 'Image loaded successfully';
//                           document.getElementById(\`status-\${product._id}\`).style.color = 'green';
//                         } else {
//                           document.getElementById(\`status-\${product._id}\`).textContent = \`Error: \${response.status} \${response.statusText}\`;
//                           document.getElementById(\`status-\${product._id}\`).style.color = 'red';
//                         }
//                       })
//                       .catch(error => {
//                         document.getElementById(\`status-\${product._id}\`).textContent = \`Error: \${error.message}\`;
//                         document.getElementById(\`status-\${product._id}\`).style.color = 'red';
//                       });
//                   }
//                 });
//               } else {
//                 container.innerHTML = '<p>No products with images found</p>';
//               }
//             });
//         </script>
//       </body>
//     </html>
//   `);
// });

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`Error: ${err.message}, Stack: ${err.stack}`);
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});

module.exports = app;