const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');

const createContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Name, email, subject and message are required');
  }

  const contact = await Contact.create({ name, email, subject, message });
  res.status(201).json({ success: true, data: contact });
});

const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({}).sort('-createdAt');
  res.json({ success: true, data: contacts });
});

const markContactRead = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error('Contact message not found');
  }
  contact.isRead = true;
  contact.readAt = new Date();
  await contact.save();
  res.json({ success: true, data: contact });
});

module.exports = { createContact, getContacts, markContactRead };
