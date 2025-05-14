const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String
  },
  images: [
    {
      path: {
        type: String,
        required: true
      },
      secure_url: {
        type: String,
        default: ""
      },
      public_id: {
        type: String,
        default: ""
      },
      isMain: {
        type: Boolean,
        default: false
      }
    }
  ],
  description: {
    type: String,
    required: true
  },
  catalog: {
    file: {
      type: String,
      default: null
    },
    secure_url: {
      type: String,
      default: ""
    },
    public_id: {
      type: String,
      default: ""
    },
    fileType: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', ''],
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    uploadDate: {
      type: Date,
      default: null
    }
  },
  hasCatalog: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 