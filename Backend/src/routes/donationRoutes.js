const express = require('express');
const {
  listDonations,
  createDonation,
  getDonationById,
  updateDonationStatus
} = require('../controllers/donationController');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const upload = require('../middlewares/upload');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', listDonations);
router.post('/', upload.array('images', 5), createDonation);
router.get('/:id', getDonationById);
router.patch('/:id/status', requireRole('admin'), updateDonationStatus);

module.exports = router;
