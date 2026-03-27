const mongoose = require('mongoose');

const clothesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other']
    },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'one-size', 'various'],
      default: 'M'
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['new', 'like-new', 'good', 'fair', 'worn']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    images: [{
      type: String
    }],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required']
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'donated'],
      default: 'available'
    },
    listingType: {
      type: String,
      enum: ['sell', 'swap', 'donate', 'auction'],
      default: 'sell'
    },
    location: {
      city: String,
      state: String,
      country: String
    },
    views: {
      type: Number,
      default: 0
    },
    // For auction listings
    auctionEndDate: {
      type: Date
    },
    currentBid: {
      type: Number,
      default: 0
    },
    // For swap listings
    swapPreferences: [{
      type: String
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
clothesSchema.index({ seller: 1, status: 1 });
clothesSchema.index({ category: 1, status: 1 });
clothesSchema.index({ listingType: 1, status: 1 });
clothesSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Clothes', clothesSchema);
