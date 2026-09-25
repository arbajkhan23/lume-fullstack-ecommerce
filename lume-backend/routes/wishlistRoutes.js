const express = require('express');
const router = express.Router();
const { protectUser } = require('../middleware/authMiddleware');
const { getWishlist, toggleWishlistItem } = require('../controllers/wishlistController');

router.use(protectUser);
router.get('/', getWishlist);
router.post('/toggle', toggleWishlistItem);

module.exports = router;
