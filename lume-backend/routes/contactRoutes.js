const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const { createContact, getContacts, markContactRead } = require('../controllers/contactController');

router.post('/', createContact);
router.get('/', protectAdmin, getContacts);
router.patch('/:id/read', protectAdmin, markContactRead);

module.exports = router;
