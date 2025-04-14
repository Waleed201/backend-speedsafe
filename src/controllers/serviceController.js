const Service = require('../models/serviceModel');
const fs = require('fs');
const path = require('path');

// @desc    Fetch all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.images) {
      req.files.images.forEach((file, index) => {
        const relativePath = `uploads/services/${path.basename(file.path)}`;
        console.log('Storing image path:', relativePath);
        images.push({
          path: relativePath,
          isMain: index === 0 // First image is the main image
        });
      });
    }
    
    // Handle catalog file
    let catalog = {
      file: null,
      fileType: '',
      fileName: '',
      uploadDate: null
    };
    let hasCatalog = false;
    
    if (req.files && req.files.catalogFile && req.files.catalogFile.length > 0) {
      const catalogFile = req.files.catalogFile[0];
      const fileExtension = path.extname(catalogFile.originalname).toLowerCase().replace('.', '');
      
      catalog = {
        file: `/uploads/catalogs/${path.basename(catalogFile.path)}`,
        fileType: fileExtension,
        fileName: catalogFile.originalname,
        uploadDate: new Date()
      };
      hasCatalog = true;
      console.log('Storing catalog:', catalog);
    }

    const service = new Service({
      name,
      description,
      images,
      catalog,
      hasCatalog
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    console.error('Service creation error:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const service = await Service.findById(req.params.id);
    
    if (service) {
      service.name = name || service.name;
      service.description = description || service.description;
      
      // Handle uploaded images
      if (req.files && req.files.images) {
        // Add new images
        req.files.images.forEach(file => {
          const relativePath = `uploads/services/${path.basename(file.path)}`;
          service.images.push({
            path: relativePath,
            isMain: service.images.length === 0 // Make it main if no images exist
          });
        });
      }
      
      // Handle catalog file
      if (req.files && req.files.catalogFile && req.files.catalogFile.length > 0) {
        // Remove old catalog if exists
        if (service.catalog && service.catalog.file) {
          const oldPath = path.join(__dirname, '../../public', service.catalog.file.startsWith('/') ? service.catalog.file.substring(1) : service.catalog.file);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        
        // Add new catalog
        const catalogFile = req.files.catalogFile[0];
        const fileExtension = path.extname(catalogFile.originalname).toLowerCase().replace('.', '');
        
        service.catalog = {
          file: `/uploads/catalogs/${path.basename(catalogFile.path)}`,
          fileType: fileExtension,
          fileName: catalogFile.originalname,
          uploadDate: new Date()
        };
        service.hasCatalog = true;
      }
      
      const updatedService = await service.save();
      res.json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (service) {
      // Delete associated images
      if (service.images && service.images.length > 0) {
        service.images.forEach(image => {
          try {
            // Handle both formats of image paths
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
        });
      }
      
      // Delete catalog if exists
      if (service.catalog && service.catalog.file) {
        try {
          // Handle both formats of catalog paths
          const catalogPath = path.join(__dirname, '../../public', service.catalog.file.startsWith('/') ? service.catalog.file.substring(1) : service.catalog.file);
          console.log('Attempting to delete catalog from:', catalogPath);
          if (fs.existsSync(catalogPath)) {
            fs.unlinkSync(catalogPath);
            console.log('Successfully deleted catalog file:', catalogPath);
          } else {
            console.log('Catalog file not found:', catalogPath);
          }
        } catch (err) {
          console.error('Error deleting catalog file:', err);
        }
      }
      
      await service.deleteOne();
      res.json({ message: 'Service and all associated files removed' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a service image
// @route   DELETE /api/services/:id/images/:imageId
// @access  Private/Admin
const deleteServiceImage = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (service) {
      const imageIndex = service.images.findIndex(
        img => img._id.toString() === req.params.imageId
      );
      
      if (imageIndex !== -1) {
        const image = service.images[imageIndex];
        
        // Delete image file
        try {
          // Handle both formats of image paths
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
        
        // Remove image from service
        service.images.splice(imageIndex, 1);
        
        // If deleted image was main and other images exist, make first image the main
        if (image.isMain && service.images.length > 0) {
          service.images[0].isMain = true;
        }
        
        await service.save();
        res.json({ message: 'Image removed', service });
      } else {
        res.status(404).json({ message: 'Image not found' });
      }
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    console.error('Error deleting service image:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get catalog for a service
// @route   GET /api/services/:id/catalog
// @access  Public
const getServiceCatalog = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findById(serviceId);

    if (!service || !service.hasCatalog) {
      return res.status(404).json({ message: 'Service catalog not found' });
    }

    res.json({
      catalog: service.catalog
    });
  } catch (error) {
    console.error('Error getting catalog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Download catalog file
// @route   GET /api/services/:id/catalog/download
// @access  Public
const downloadServiceCatalog = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findById(serviceId);

    if (!service || !service.hasCatalog) {
      return res.status(404).json({ message: 'Service catalog not found' });
    }

    const filePath = path.join(__dirname, '../../public', service.catalog.file.startsWith('/') ? service.catalog.file.substring(1) : service.catalog.file);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Catalog file not found on server' });
    }

    // Use original filename if available
    const fileName = service.catalog.fileName || `${service.name}_catalog.${service.catalog.fileType}`;

    res.download(filePath, fileName);
  } catch (error) {
    console.error('Error downloading catalog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete catalog for a service
// @route   DELETE /api/services/:id/catalog
// @access  Private/Admin
const deleteServiceCatalog = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (!service.hasCatalog) {
      return res.status(400).json({ message: 'This service has no catalog to delete' });
    }

    // Delete the physical file
    if (service.catalog && service.catalog.file) {
      const filePath = path.join(__dirname, '../../public', service.catalog.file.startsWith('/') ? service.catalog.file.substring(1) : service.catalog.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Reset catalog fields
    service.catalog = {
      file: null,
      fileType: '',
      fileName: '',
      uploadDate: null
    };
    service.hasCatalog = false;

    await service.save();

    res.json({
      message: 'Catalog deleted successfully',
      service
    });
  } catch (error) {
    console.error('Error deleting catalog:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  deleteServiceImage,
  getServiceCatalog,
  downloadServiceCatalog,
  deleteServiceCatalog
}; 