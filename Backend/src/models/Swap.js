const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required']
    },
    requestedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requested from user is required']
    },
    offeredItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clothes',
      required: true
    }],
    requestedItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clothes',
      required: true
    }],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    meetupDetails: {
      location: String,
      date: Date,
      notes: String
    },
    ecoPointsAwarded: {
      requester: {
        type: Number,
        default: 0
      },
      requestedFrom: {
        type: Number,
        default: 0
      }
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
swapSchema.index({ requester: 1, status: 1 });
swapSchema.index({ requestedFrom: 1, status: 1 });
swapSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Swap', swapSchema);
