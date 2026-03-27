const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clothes',
      required: [true, 'Item reference is required']
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Bidder is required']
    },
    amount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: [0, 'Bid amount cannot be negative']
    },
    status: {
      type: String,
      enum: ['active', 'outbid', 'won', 'lost', 'cancelled'],
      default: 'active'
    },
    isAutoBid: {
      type: Boolean,
      default: false
    },
    maxAutoBidAmount: {
      type: Number,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
bidSchema.index({ item: 1, amount: -1 });
bidSchema.index({ bidder: 1, status: 1 });
bidSchema.index({ item: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Bid', bidSchema);
