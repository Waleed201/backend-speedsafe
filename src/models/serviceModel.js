const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    nameAr: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    descriptionAr: {
      type: String,
      default: ''
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
  },
  {
    timestamps: true
  }
);

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service; 