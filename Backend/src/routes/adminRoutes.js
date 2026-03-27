const express = require('express');
const { 
  getStats, 
  getActivities, 
  getAllMessages, 
  banUser, 
  getAnalytics 
} = require('../controllers/adminController');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth, requireRole('admin'));

router.get('/stats', getStats);
router.get('/activities', getActivities);
router.get('/messages', getAllMessages);
router.patch('/users/:id/ban', banUser);
router.get('/analytics', getAnalytics);

module.exports = router;
