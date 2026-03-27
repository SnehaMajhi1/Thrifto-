const Post = require('../models/Post');

const listPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      author,
      visibility = 'public'
    } = req.query;

    const query = {};

    // Filter by visibility
    if (visibility) {
      query.visibility = visibility;
    }

    // Filter by author
    if (author) {
      query.author = author;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email profilePicture')
        .populate('relatedItem', 'title images price')
        .populate('comments.user', 'name profilePicture')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 }),
      Post.countDocuments(query)
    ]);

    return res.status(200).json({
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('List posts error:', error);
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

const createPost = async (req, res) => {
  try {
    const postData = req.body;

    // Set author to current user
    postData.author = req.userId;

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      postData.images = req.files.map(f => `/uploads/${f.filename}`);
    } else if (postData.images && typeof postData.images === 'string') {
      postData.images = postData.images.split(',').map(url => url.trim()).filter(Boolean);
    }

    // Validate images
    if (!postData.images || postData.images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const post = await Post.create(postData);
    await post.populate('author', 'name email profilePicture');

    return res.status(201).json({ data: post });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Create post error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Failed to create post' });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('author', 'name email profilePicture')
      .populate('relatedItem', 'title images price status')
      .populate('comments.user', 'name profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({ data: post });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get post error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    return res.status(500).json({ message: 'Failed to fetch post' });
  }
};

const deletePostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only author or admin can delete
    if (post.author.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Delete post error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    return res.status(500).json({ message: 'Failed to delete post' });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Toggle like
    const likeIndex = post.likes.findIndex(like => like.toString() === userId);

    if (likeIndex === -1) {
      // Add like
      post.likes.push(userId);
    } else {
      // Remove like
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    return res.status(200).json({ data: post, message: likeIndex === -1 ? 'Post liked' : 'Post unliked' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Like post error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    return res.status(500).json({ message: 'Failed to like/unlike post' });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.userId,
      text: text.trim(),
      createdAt: new Date()
    });

    await post.save();
    await post.populate('comments.user', 'name profilePicture');

    return res.status(201).json({ data: post, message: 'Comment added successfully' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Add comment error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    return res.status(500).json({ message: 'Failed to add comment' });
  }
};

const updatePostById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(f => `/uploads/${f.filename}`);
    } else if (updates.images && typeof updates.images === 'string') {
      updates.images = updates.images.split(',').map(url => url.trim()).filter(Boolean);
    }

    // Only author or admin can update
    if (post.author.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only update your own posts' });
    }

    // Don't allow updating certain fields
    delete updates.author;
    delete updates.likes;
    delete updates.comments;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updated = await Post.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('author', 'name email profilePicture');

    return res.status(200).json({ data: updated });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Update post error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    return res.status(500).json({ message: 'Failed to update post' });
  }
};

module.exports = { listPosts, createPost, getPostById, updatePostById, deletePostById, likePost, addComment };
