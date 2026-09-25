const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const { makeUploader } = require('../config/cloudinary');
const {
  getCategories,
  getCategoryBySlug,
  getCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const upload = makeUploader('categories');

router.get('/', getCategories);
router.get('/admin/all', protectAdmin, getCategoriesAdmin);
router.get('/:slug', getCategoryBySlug);

router.post('/', protectAdmin, upload.single('image'), createCategory);
router.put('/:id', protectAdmin, upload.single('image'), updateCategory);
router.delete('/:id', protectAdmin, deleteCategory);

module.exports = router;
