const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  deleteProductImage,
  setMainProductImage,
  getProductsByCategory,
  createProductReview,
  getTopProducts,
  getProductsBySearch,
  getProductsByFilter,
  getProductCategories
} = require('../controllers/productController');
const {
  uploadCatalog,
  getCatalog,
  downloadCatalog,
  deleteCatalog,
  getProductsWithCatalogs
} = require('../controllers/catalogController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, handleUploadErrors } = require('../middleware/uploadMiddleware');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer storage for catalog files
const catalogStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/catalogs');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'catalog-' + uniqueSuffix + ext);
  }
});

const catalogUpload = multer({ 
  storage: catalogStorage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Public routes
router.get('/', getProducts);
router.get('/top', getTopProducts);
router.get('/search', getProductsBySearch);
router.get('/filter', getProductsByFilter);
router.get('/with-catalogs', getProductsWithCatalogs);
router.get('/categories', getProductCategories);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);
router.get('/:id/catalog', getCatalog);
router.get('/:id/catalog/download', downloadCatalog);

// Protected routes (admin only)
router.post('/', protect, admin, upload, handleUploadErrors, (req, res) => {
  // Set default values for required fields if missing
  const updatedBody = { 
    ...req.body,
  };
  req.body = updatedBody;
  
  // Pass to the regular controller
  createProduct(req, res);
});
router.put('/:id', protect, admin, upload, handleUploadErrors, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.delete('/:id/images/:imageId', protect, admin, deleteProductImage);
router.put('/:id/images/:imageId/main', protect, admin, setMainProductImage);

// Catalog routes
router.post('/:id/catalog', protect, admin, catalogUpload.single('catalog'), uploadCatalog);
router.delete('/:id/catalog', protect, admin, deleteCatalog);

// Test route for debugging
router.post('/debug-test', upload, handleUploadErrors, (req, res) => {
  console.log('Request body:', req.body);
  console.log('File:', req.file);
  
  try {
    // Check if uploads directory exists
    const uploadDir = path.resolve(__dirname, '../../public/uploads/products');
    console.log('Upload directory:', uploadDir);
    console.log('Directory exists:', fs.existsSync(uploadDir));
    
    // Try to save a test file
    const testFile = path.join(uploadDir, 'test-file.txt');
    fs.writeFileSync(testFile, 'test');
    console.log('Test file created successfully');
    
    res.json({ 
      success: true, 
      message: 'Test route successful',
      file: req.file,
      uploadDir: uploadDir,
      dirExists: fs.existsSync(uploadDir)
    });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
});

// Test route for full product creation
router.post('/test-full-product', upload, handleUploadErrors, (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    // Manually create a product record
    const { name, nameAr, description, descriptionAr } = req.body;
    
    // Process images
    let images = [];
    if (req.files && req.files.images) {
      images = req.files.images.map((file, index) => {
        const path = `uploads/products/${file.filename}`;
        console.log('Image path:', path);
        return { path, isMain: index === 0 };
      });
    }
    
    // Process catalog
    let catalog = null;
    let hasCatalog = false;
    
    if (req.files && req.files.catalogFile && req.files.catalogFile.length > 0) {
      const catalogFile = req.files.catalogFile[0];
      const fileExtension = path.extname(catalogFile.originalname).toLowerCase().replace('.', '');
      
      catalog = {
        file: `/uploads/catalogs/${catalogFile.filename}`,
        fileType: fileExtension,
        fileName: catalogFile.originalname,
        uploadDate: new Date()
      };
      hasCatalog = true;
      console.log('Catalog info:', catalog);
    }
    
    // Return the product data
    res.status(201).json({
      success: true,
      product: {
        name,
        nameAr,
        description,
        descriptionAr,
        images,
        catalog,
        hasCatalog
      }
    });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
});

// Private routes
router.post('/:id/reviews', protect, createProductReview);

module.exports = router; 