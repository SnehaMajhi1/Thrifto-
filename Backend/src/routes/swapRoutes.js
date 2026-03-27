const express = require('express');
const { listSwaps, createSwap, updateSwapById } = require('../controllers/swapController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', listSwaps);
router.post('/', createSwap);
router.patch('/:id', updateSwapById);

module.exports = router;
