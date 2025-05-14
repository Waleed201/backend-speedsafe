const Product = require('../models/productModel');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Helper function to upload file to Cloudinary
const uploadFileToCloudinary = async (file, folderName) => {
  try {
    const result = await uploadToCloudinary(file.path, {
      folder: `speedsafe/${folderName}`,
      public_id: `${folderName}_${Date.now()}`,
      resource_type: 'auto'
    });
    
    // Delete local file after upload
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    return result;
  } catch (error) {
    console.error(`Error uploading to Cloudinary (${folderName}):`, error);
    throw error;
  }
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all product categories
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    // Extract data from request body with defaults for required fields
    const { 
      name, 
      description,  
      category
    } = req.body;
    
    // Handle uploaded images
    const images = [];
    if (req.files && req.files.images) {
      // Upload each image to Cloudinary
      for (let i = 0; i < req.files.images.length; i++) {
        try {
          const file = req.files.images[i];
          const uploadResult = await uploadFileToCloudinary(file, 'products');
          
          images.push({
            path: uploadResult.url,
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            isMain: i === 0 // First image is the main image
          });
        } catch (error) {
          console.error('Image upload error:', error);
          // Continue with other images even if one fails
        }
      }
    }
    
    // Handle catalog file
    let catalog = {
      file: null,
      secure_url: '',
      public_id: '',
      fileType: '',
      fileName: '',
      uploadDate: null
    };
    let hasCatalog = false;
    
    if (req.files && req.files.catalogFile && req.files.catalogFile.length > 0) {
      try {
        const catalogFile = req.files.catalogFile[0];
        const fileExtension = path.extname(catalogFile.originalname).toLowerCase().replace('.', '');
        
        // Upload catalog to Cloudinary
        const uploadResult = await uploadFileToCloudinary(catalogFile, 'catalogs');
        
        catalog = {
          file: uploadResult.url,
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          fileType: fileExtension,
          fileName: catalogFile.originalname,
          uploadDate: new Date()
        };
        hasCatalog = true;
      } catch (error) {
        console.error('Catalog upload error:', error);
        // Continue creating the product even if catalog upload fails
      }
    }
    
    const product = new Product({
      name,
      description,
      category,
      images,
      catalog,
      hasCatalog
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.category = category || product.category;
      
      // Handle uploaded images
      if (req.files && req.files.images) {
        // Upload new images to Cloudinary
        for (const file of req.files.images) {
          try {
            const uploadResult = await uploadFileToCloudinary(file, 'products');
            
            product.images.push({
              path: uploadResult.url,
              secure_url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
              isMain: product.images.length === 0 // Make it main if no images exist
            });
          } catch (error) {
            console.error('Image upload error during update:', error);
            // Continue with other images even if one fails
          }
        }
      }
      
      // Handle catalog file
      if (req.files && req.files.catalogFile && req.files.catalogFile.length > 0) {
        try {
          // Remove old catalog from Cloudinary if exists
          if (product.catalog && product.catalog.public_id) {
            try {
              await deleteFromCloudinary(product.catalog.public_id);
            } catch (deleteError) {
              console.error('Error deleting old catalog:', deleteError);
              // Continue even if deletion fails
            }
          }
          
          // Upload new catalog
          const catalogFile = req.files.catalogFile[0];
          const fileExtension = path.extname(catalogFile.originalname).toLowerCase().replace('.', '');
          
          const uploadResult = await uploadFileToCloudinary(catalogFile, 'catalogs');
          
          product.catalog = {
            file: uploadResult.url,
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            fileType: fileExtension,
            fileName: catalogFile.originalname,
            uploadDate: new Date()
          };
          product.hasCatalog = true;
        } catch (error) {
          console.error('Catalog upload error during update:', error);
          // Continue updating the product even if catalog upload fails
        }
      }
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      // Delete associated images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          if (image.public_id) {
            try {
              await deleteFromCloudinary(image.public_id);
              console.log('Successfully deleted image from Cloudinary:', image.public_id);
            } catch (err) {
              console.error('Error deleting image from Cloudinary:', err);
              // Continue deleting other images even if one fails
            }
          }
        }
      }
      
      // Delete catalog from Cloudinary if exists
      if (product.catalog && product.catalog.public_id) {
        try {
          await deleteFromCloudinary(product.catalog.public_id);
          console.log('Successfully deleted catalog from Cloudinary:', product.catalog.public_id);
        } catch (err) {
          console.error('Error deleting catalog from Cloudinary:', err);
          // Continue with product deletion even if catalog deletion fails
        }
      }
      
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Admin
const deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      const imageIndex = product.images.findIndex(
        img => img._id.toString() === req.params.imageId
      );
      
      if (imageIndex !== -1) {
        const image = product.images[imageIndex];
        
        // Delete image file
        try {
          // Handle both formats of image paths (with or without leading slash)
          const imagePath = path.join(__dirname, '../../public', image.path.startsWith('/') ? image.path.substring(1) : image.path);
          console.log('Attempting to delete image from:', imagePath);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('Successfully deleted image file:', imagePath);
          } else {
            console.log('Image file not found:', imagePath);
          }
        } catch (err) {
          console.error('Error deleting image file:', err);
        }
        
        // Remove image from product
        product.images.splice(imageIndex, 1);
        
        // If deleted image was main and other images exist, make first image the main
        if (image.isMain && product.images.length > 0) {
          product.images[0].isMain = true;
        }
        
        await product.save();
        res.json({ message: 'Image removed', product });
      } else {
        res.status(404).json({ message: 'Image not found' });
      }
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Set main product image
// @route   PUT /api/products/:id/images/:imageId/main
// @access  Private/Admin
const setMainProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      // Reset all images to non-main
      product.images.forEach(img => {
        img.isMain = false;
      });
      
      // Find target image and set as main
      const image = product.images.find(
        img => img._id.toString() === req.params.imageId
      );
      
      if (image) {
        image.isMain = true;
        await product.save();
        res.json({ message: 'Main image updated', product });
      } else {
        res.status(404).json({ message: 'Image not found' });
      }
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    res.status(501).json({ message: 'Review functionality not implemented yet' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get top products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({}).limit(3);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get products by search
// @route   GET /api/products/search
// @access  Public
const getProductsBySearch = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const products = await Product.find({ ...keyword });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get products by filter
// @route   GET /api/products/filter
// @access  Public
const getProductsByFilter = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  setMainProductImage,
  getProductsByCategory,
  getProductCategories,
  createProductReview,
  getTopProducts,
  getProductsBySearch,
  getProductsByFilter,
}; 