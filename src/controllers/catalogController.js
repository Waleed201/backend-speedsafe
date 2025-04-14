const Product = require('../models/productModel');
const fs = require('fs');
const path = require('path');

// @desc    Upload catalog for a product
// @route   POST /api/products/:id/catalog
// @access  Private/Admin
const uploadCatalog = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a catalog file' });
    }

    // Get file type from extension
    const fileExtension = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
    
    if (!allowedExtensions.includes(fileExtension)) {
      // Delete uploaded file if it's not an allowed type
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: 'Invalid file type. Only PDF, Word, PowerPoint, and Excel files are allowed' 
      });
    }

    // Remove old catalog file if exists
    if (product.catalog && product.catalog.file) {
      const oldFilePath = path.join(__dirname, '../../public', product.catalog.file);
      console.log('Old file path:', oldFilePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Save catalog info to product
    product.catalog = {
      file: `/uploads/catalogs/${req.file.filename}`,
      fileType: fileExtension,
      fileName: req.file.originalname,
      uploadDate: new Date()
    };
    product.hasCatalog = true;

    await product.save();

    res.json({
      message: 'Catalog uploaded successfully',
      product
    });
  } catch (error) {
    console.error('Error uploading catalog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get catalog for a product
// @route   GET /api/products/:id/catalog
// @access  Public
const getCatalog = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product || !product.hasCatalog) {
      return res.status(404).json({ message: 'Product catalog not found' });
    }

    res.json({
      catalog: product.catalog
    });
  } catch (error) {
    console.error('Error getting catalog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Download catalog file
// @route   GET /api/products/:id/catalog/download
// @access  Public
const downloadCatalog = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product || !product.hasCatalog) {
      return res.status(404).json({ message: 'Product catalog not found' });
    }

    const filePath = path.join(__dirname, '../../', product.catalog.file);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Catalog file not found on server' });
    }

    // Use original filename if available
    const fileName = product.catalog.fileName || `${product.name}_catalog.${product.catalog.fileType}`;

    res.download(filePath, fileName);
  } catch (error) {
    console.error('Error downloading catalog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete catalog for a product
// @route   DELETE /api/products/:id/catalog
// @access  Private/Admin
const deleteCatalog = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.hasCatalog) {
      return res.status(400).json({ message: 'This product has no catalog to delete' });
    }

    // Delete the physical file
    if (product.catalog && product.catalog.file) {
      const filePath = path.join(__dirname, '../../', product.catalog.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Reset catalog fields
    product.catalog = {
      file: null,
      fileType: '',
      fileName: '',
      uploadDate: null
    };
    product.hasCatalog = false;

    await product.save();

    res.json({
      message: 'Catalog deleted successfully',
      product
    });
  } catch (error) {
    console.error('Error deleting catalog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get products with catalogs
// @route   GET /api/products/with-catalogs
// @access  Public
const getProductsWithCatalogs = async (req, res) => {
  try {
    const products = await Product.find({ hasCatalog: true });
    res.json(products);
  } catch (error) {
    console.error('Error getting products with catalogs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  uploadCatalog,
  getCatalog,
  downloadCatalog,
  deleteCatalog,
  getProductsWithCatalogs
}; 