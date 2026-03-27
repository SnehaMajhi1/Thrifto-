const express = require('express');
const { createReview, getUserReviews } = require('../controllers/reviewController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get('/user/:userId', getUserReviews);
router.post('/', auth, createReview);

module.exports = router;
