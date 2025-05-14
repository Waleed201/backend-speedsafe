const multer = require('multer');
const path = require('path');

// Define storage settings for different file types
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath = '../../public/uploads/';
    
    // Determine the appropriate subfolder based on field name first, then route
    if (file.fieldname === 'catalogFile') {
      uploadPath += 'catalogs';
    } else if (file.fieldname === 'logo') {
      uploadPath += 'company';
    } else if (req.originalUrl.includes('/products')) {
      uploadPath += 'products';
    } else if (req.originalUrl.includes('/partners')) {
      uploadPath += 'partners';
    } else if (req.originalUrl.includes('/services')) {
      uploadPath += 'services';
    }
    
    // Resolve to absolute path to avoid any confusion
    const absolutePath = path.resolve(__dirname, uploadPath);
    console.log('Saving file to:', absolutePath);
    
    cb(null, absolutePath);
  },
  filename: function(req, file, cb) {
    // Create a unique filename: original name + timestamp + extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File validation
const fileFilter = (req, file, cb) => {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  const validDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  
  // Check if the file is for a catalog (either in catalog route or named catalogFile)
  const isCatalogFile = req.originalUrl.includes('/catalogs') || file.fieldname === 'catalogFile';
  
  if (isCatalogFile) {
    // For catalogs, allow PDFs, Word docs, PowerPoint, and Excel files
    if (validDocumentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, PowerPoint, and Excel files are allowed for catalogs.'), false);
    }
  } else {
    // For other uploads, allow only images
    if (validImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, GIF, and WEBP files are allowed.'), false);
    }
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB size limit
  }
}).fields([
  { name: 'images', maxCount: 5 },
  { name: 'catalogFile', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]);

// Error handling middleware for file upload errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    console.error('Multer upload error:', err);
    return res.status(400).json({ 
      message: 'File upload error', 
      error: err.message,
      code: err.code
    });
  } else if (err) {
    // An unknown error occurred
    console.error('Unknown upload error:', err);
    return res.status(500).json({ 
      message: 'Server error during file upload', 
      error: err.message 
    });
  }
  // No error, continue
  next();
};

module.exports = { upload, handleUploadErrors }; 