const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const { makeUploader } = require('../config/cloudinary');
const {
  getBanners,
  getBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');

const upload = makeUploader('banners');

router.get('/', getBanners);
router.get('/admin/all', protectAdmin, getBannersAdmin);

router.post('/', protectAdmin, upload.single('image'), createBanner);
router.put('/:id', protectAdmin, upload.single('image'), updateBanner);
router.delete('/:id', protectAdmin, deleteBanner);

module.exports = router;
