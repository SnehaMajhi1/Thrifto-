const express = require('express');
const {
  listClothes,
  createClothes,
  getClothesById,
  updateClothesById,
  deleteClothesById,
  getNearby,
  getRecommended
} = require('../controllers/clothesController');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

// Public route - anyone can view listings
router.get('/', listClothes);
router.get('/nearby', auth, getNearby);
router.get('/recommended', auth, getRecommended);
router.get('/:id', getClothesById);

// Protected routes - require authentication
router.post('/', auth, upload.array('images', 5), createClothes);
router.patch('/:id', auth, upload.array('images', 5), updateClothesById);
router.delete('/:id', auth, deleteClothesById);

module.exports = router;
