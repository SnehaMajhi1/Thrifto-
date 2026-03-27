const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500
    },
    swap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Swap'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  },
  {
    timestamps: true
  }
);

// Prevent users from reviewing themselves
reviewSchema.pre('save', function(next) {
  if (this.reviewer.toString() === this.reviewedUser.toString()) {
    return next(new Error('You cannot review yourself'));
  }
  next();
});

reviewSchema.index({ reviewedUser: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
