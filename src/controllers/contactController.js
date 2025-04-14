const Contact = require('../models/contactModel');

// @desc    Create a new contact message
// @route   POST /api/contact
// @access  Public
const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Basic validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }
    
    const contact = new Contact({
      name,
      email,
      phone,
      message
    });
    
    const createdContact = await contact.save();
    res.status(201).json({
      message: 'Thank you for your message. We will get back to you soon!',
      contact: createdContact
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get a single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ message: 'Contact not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update contact read status
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
const markContactAsRead = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (contact) {
      contact.isRead = true;
      await contact.save();
      res.json({ message: 'Contact marked as read', contact });
    } else {
      res.status(404).json({ message: 'Contact not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (contact) {
      await contact.deleteOne();
      res.json({ message: 'Contact message removed' });
    } else {
      res.status(404).json({ message: 'Contact not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  markContactAsRead,
  deleteContact
}; 