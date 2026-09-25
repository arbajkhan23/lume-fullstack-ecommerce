const express = require('express');
const router = express.Router();
const { protectUser, protectAdmin } = require('../middleware/authMiddleware');
const { getUsers, getUserById, updateUserStatus } = require('../controllers/userController');
const { getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/addressController');

// Customer address book (self-service)
router.get('/addresses', protectUser, getAddresses);
router.post('/addresses', protectUser, addAddress);
router.put('/addresses/:id', protectUser, updateAddress);
router.delete('/addresses/:id', protectUser, deleteAddress);

// Admin customer management
router.get('/', protectAdmin, getUsers);
router.get('/:id', protectAdmin, getUserById);
router.put('/:id/status', protectAdmin, updateUserStatus);

module.exports = router;
