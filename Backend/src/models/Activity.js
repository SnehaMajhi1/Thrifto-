const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    details: {
      type: String,
      trim: true
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      // Generic ref, depends on the action
    },
    type: {
      type: String,
      enum: ['user', 'item', 'chat', 'swap', 'donation', 'system'],
      default: 'system'
    }
  },
  {
    timestamps: true
  }
);

// Index for performance
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
