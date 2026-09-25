const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const { getActiveDeals, getDealsAdmin, createDeal, updateDeal, deleteDeal } = require('../controllers/dealController');

router.get('/active', getActiveDeals);

router.get('/', protectAdmin, getDealsAdmin);
router.post('/', protectAdmin, createDeal);
router.put('/:id', protectAdmin, updateDeal);
router.delete('/:id', protectAdmin, deleteDeal);

module.exports = router;
