const mongoose = require('mongoose');

const companyInfoSchema = mongoose.Schema(
  {
    logo: {
      path: { type: String, default: "" },
      secure_url: { type: String, default: "" },
      public_id: { type: String, default: "" },
      altText: { type: String, default: "Company Logo" }
    },
    address: {
      street: { type: String, required: true, default: "123 Security Avenue" },
      suite: { type: String, default: "Suite 500" },
      city: { type: String, required: true, default: "Riyadh" },
      country: { type: String, required: true, default: "Saudi Arabia" },
      fullAddress: { type: String }
    },
    phone: {
      main: { type: String, required: true, default: "+966 558 128 XXX" },
      support: { type: String, default: "+966 558 128 XXX" }
    },
    email: {
      general: { type: String, required: true, default: "info@speedsafe.com" },
      sales: { type: String, default: "sales@speedsafe.com" },
      support: { type: String, default: "support@speedsafe.com" }
    },
    businessHours: {
      weekdays: { type: String, default: "Sunday - Thursday: 9:00 AM - 6:00 PM" },
      weekend: { type: String, default: "Friday - Saturday: Closed" }
    },
    socialMedia: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" }
    },
    themeColor: {
      type: String,
      default: "yellow" // Default yellow color
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to update fullAddress field
companyInfoSchema.pre('save', function(next) {
  this.address.fullAddress = `${this.address.street}, ${this.address.suite}, ${this.address.city}, ${this.address.country}`;
  next();
});

// Allow only one company info document
companyInfoSchema.statics.findOneOrCreate = async function() {
  const companyInfo = await this.findOne();
  if (companyInfo) {
    return companyInfo;
  }
  
  return this.create({});
};

const CompanyInfo = mongoose.model('CompanyInfo', companyInfoSchema);

module.exports = CompanyInfo;