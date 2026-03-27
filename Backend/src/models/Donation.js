const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor is required']
    },
    items: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: String,
      category: String,
      quantity: {
        type: Number,
        default: 1,
        min: 1
      },
      condition: {
        type: String,
        enum: ['new', 'like-new', 'good', 'fair'],
        default: 'good'
      },
      images: [String]
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'collected', 'completed', 'cancelled'],
      default: 'pending'
    },
    pickupLocation: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    preferredPickupDate: {
      type: Date
    },
    actualPickupDate: {
      type: Date
    },
    donationCenter: {
      name: String,
      contact: String,
      address: String
    },
    ecoPointsAwarded: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// Index for better query performance
donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
