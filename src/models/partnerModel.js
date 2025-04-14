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
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner; 