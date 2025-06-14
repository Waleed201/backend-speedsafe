const mongoose = require('mongoose');

// Generic content model schema with flexible data structure
const contentSchema = mongoose.Schema(
  {
    contentType: {
      type: String,
      required: true,
      enum: ['home', 'about', 'services', 'products', 'partners', 'gallery', 'contact'],
    },
    language: {
      type: String,
      required: true,
      enum: ['EN', 'AR'],
      default: 'EN'
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Create a compound index for contentType and language to ensure uniqueness
contentSchema.index({ contentType: 1, language: 1 }, { unique: true });

// Helper method to find or create content by type and language
contentSchema.statics.findOrCreateByType = async function(contentType, language = 'EN', defaultData = {}) {
  let content = await this.findOne({ contentType, language });
  
  if (!content) {
    content = await this.create({
      contentType,
      language,
      data: defaultData
    });
  }
  
  return content;
};

const Content = mongoose.model('Content', contentSchema);

module.exports = Content; 