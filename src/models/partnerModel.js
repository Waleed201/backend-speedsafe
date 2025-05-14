const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String
    },
    website: {
      type: String
    },
    logo: {
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
      }
    }
  },
  {
    timestamps: true
  }
);

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner; 