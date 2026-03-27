const express = require('express');
const { listChats, createChat, listMessages, sendMessage, createAdminChat } = require('../controllers/chatController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', listChats);
router.post('/', createChat);
router.post('/admin', createAdminChat);
router.get('/:id/messages', listMessages);
router.post('/:id/messages', sendMessage);

module.exports = router;
