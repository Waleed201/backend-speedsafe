const mongoose = require('mongoose');
const Content = require('../src/models/contentModel');

// Replace with your MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/speedsafe';

// Footer content data
const footerEN = {
  companyName: "SpeedSafe",
  companyDescription: "We provide high-quality security packaging solutions for cash-in-transit companies, retailers, and couriers, focusing on reliability and excellence.",
  email: "info@speedsafe.com",
  phone: "+1 (123) 456-7890",
  contactUsTitle: "Contact Us",
  contactUsDescription: "Interested in our security packaging solutions? Get in touch with us for a consultation.",
  contactUsButton: "Contact Us"
};

const footerAR = {
  companyName: "السرعة والأمان",
  companyDescription: "نوفر حلول تغليف أمني عالية الجودة لشركات نقل الأموال والمتاجر والنقالات مع التركيز على الموثوقية والتميز.",
  email: "info@speedsafe.com",
  phone: "+1 (123) 456-7890",
  contactUsTitle: "تواصل معنا",
  contactUsDescription: "مهتم بحلولنا للتغليف الأمني؟ تواصل معنا للحصول على استشارة.",
  contactUsButton: "اتصل بنا"
};

async function saveFooterContent() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Upsert English footer
    await Content.findOneAndUpdate(
      { contentType: 'footer', language: 'EN' },
      { contentType: 'footer', language: 'EN', data: footerEN },
      { upsert: true, new: true }
    );

    // Upsert Arabic footer
    await Content.findOneAndUpdate(
      { contentType: 'footer', language: 'AR' },
      { contentType: 'footer', language: 'AR', data: footerAR },
      { upsert: true, new: true }
    );

    console.log('Footer content saved successfully!');
  } catch (err) {
    console.error('Error saving footer content:', err);
  } finally {
    mongoose.connection.close();
  }
}

saveFooterContent();