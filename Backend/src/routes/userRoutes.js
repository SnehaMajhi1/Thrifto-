const express = require('express');
const {
  listUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  updatePassword,
  getDashboardStats,
  toggleWishlist,
  getWishlist
} = require('../controllers/userController');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const upload = require('../middlewares/upload');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', requireRole('admin'), listUsers);
router.get('/me/dashboard', getDashboardStats);
router.post('/wishlist', toggleWishlist);
router.get('/wishlist', getWishlist);
router.get('/:id', getUserById);
router.patch('/:id', upload.single('profilePicture'), updateUserById);
router.delete('/:id', requireRole('admin'), deleteUserById);
router.post('/password', updatePassword);

module.exports = router;
