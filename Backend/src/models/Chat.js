const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    lastMessage: {
      message: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: Date
    },
    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clothes'
    },
    relatedSwap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Swap'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure only 2 participants in a chat
chatSchema.pre('save', function () {
  if (this.participants.length !== 2) {
    throw new Error('Chat must have exactly 2 participants');
  }
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ 'lastMessage.createdAt': -1 });

module.exports = mongoose.model('Chat', chatSchema);
