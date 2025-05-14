const mongoose = require('mongoose');

// Generic content model schema with flexible data structure
const contentSchema = mongoose.Schema(
  {
    contentType: {
      type: String,
      required: true,
      enum: ['home', 'about', 'services', 'products', 'partners', 'gallery', 'contact'],
      unique: true
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

// Helper method to find or create content by type
contentSchema.statics.findOrCreateByType = async function(contentType, defaultData = {}) {
  let content = await this.findOne({ contentType });
  
  if (!content) {
    content = await this.create({
      contentType,
      data: defaultData
    });
  }
  
  return content;
};

const Content = mongoose.model('Content', contentSchema);

module.exports = Content; 