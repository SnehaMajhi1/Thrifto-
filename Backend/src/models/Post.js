const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [1000, 'Caption cannot exceed 1000 characters']
    },
    images: [{
      type: String,
      required: true
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clothes'
    },
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
