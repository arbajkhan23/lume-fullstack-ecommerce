const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const { makeUploader } = require('../config/cloudinary');
const {
  getProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsAdmin,
} = require('../controllers/productController');

const upload = makeUploader('products');

// Public storefront routes
router.get('/', getProducts);
router.get('/admin/all', protectAdmin, getProductsAdmin); // before /:idOrSlug so it doesn't get swallowed
router.get('/:id/related', getRelatedProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);

// Admin CRUD (multipart/form-data, field name "images", up to 6 files)
router.post('/', protectAdmin, upload.array('images', 6), createProduct);
router.put('/:id', protectAdmin, upload.array('images', 6), updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);

module.exports = router;
