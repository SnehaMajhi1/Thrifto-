const Review = require('../models/Review');
const User = require('../models/User');
const { sendNotification } = require('../utils/notificationHelper');
const { logActivity } = require('../utils/activityLogger');

const createReview = async (req, res) => {
  try {
    const { reviewedUserId, rating, comment, swapId, orderId } = req.body;
    
    if (req.userId === reviewedUserId) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    const review = await Review.create({
      reviewer: req.userId,
      reviewedUser: reviewedUserId,
      rating,
      comment,
      swap: swapId,
      order: orderId
    });

    await logActivity(req.userId, `reviewed user: ${reviewedUserId}`, 'user', `Rating: ${rating}`, reviewedUserId);
    await sendNotification(reviewedUserId, 'review', `You received a ${rating}-star review!`, req.userId, review._id);

    res.status(201).json({ data: review });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create review' });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewedUser: userId })
      .populate('reviewer', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({ data: reviews });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

module.exports = { createReview, getUserReviews };
