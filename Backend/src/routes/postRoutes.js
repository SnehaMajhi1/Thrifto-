const express = require('express');
const {
  listPosts,
  createPost,
  getPostById,
  updatePostById,
  deletePostById,
  likePost,
  addComment
} = require('../controllers/postController');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

// Public routes
router.get('/', listPosts);
router.get('/:id', getPostById);

// Protected routes
router.post('/', auth, upload.array('images', 5), createPost);
router.patch('/:id', auth, upload.array('images', 5), updatePostById);
router.delete('/:id', auth, deletePostById);
router.post('/:id/like', auth, likePost);
router.post('/:id/comments', auth, addComment);

module.exports = router;
