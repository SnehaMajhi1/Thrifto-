const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role } = req.query;
    
    const query = { isActive: true };
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role && ['user', 'admin'].includes(role)) {
      query.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    return res.status(200).json({
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('List users error:', error);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-passwordHash -__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Users can only update their own profile (unless admin)
    if (req.userRole !== 'admin' && req.userId !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Don't allow updating certain fields
    delete updates.passwordHash;
    delete updates.role;  // Only admins can change roles via separate endpoint
    delete updates.ecoPoints;  // EcoPoints managed by system
    delete updates.createdAt;
    delete updates.updatedAt;

    // Handle profile picture upload
    if (req.file) {
      updates.profilePicture = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Update user error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    return res.status(500).json({ message: 'Failed to update user' });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete (deactivate account)
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    ).select('-passwordHash -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deactivated successfully', data: user });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Delete user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    return res.status(500).json({ message: 'Failed to delete user' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash and save new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Update password error:', error);
    return res.status(500).json({ message: 'Failed to update password' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    const [
      activeListings,
      soldItems,
      pendingSwaps,
      completedSwaps,
      pendingDonations,
      completedDonations,
      activeChats
    ] = await Promise.all([
      require('../models/Clothes').countDocuments({ seller: userId, status: 'available', listingType: 'sell' }),
      require('../models/Clothes').countDocuments({ seller: userId, status: 'sold', listingType: 'sell' }),
      require('../models/Swap').countDocuments({
        $or: [{ requester: userId }, { requestedFrom: userId }],
        status: { $in: ['pending', 'accepted'] }
      }),
      require('../models/Swap').countDocuments({
        $or: [{ requester: userId }, { requestedFrom: userId }],
        status: 'completed'
      }),
      require('../models/Donation').countDocuments({ donor: userId, status: 'pending' }),
      require('../models/Donation').countDocuments({ donor: userId, status: 'completed' }),
      require('../models/Chat').countDocuments({ participants: userId, isActive: true })
    ]);

    const userChats = await require('../models/Chat').find({ participants: userId }).select('_id');
    const chatIds = userChats.map(c => c._id);
    const unreadCount = await require('../models/Message').countDocuments({
      chat: { $in: chatIds },
      sender: { $ne: userId },
      isRead: false
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const trendData = await require('../models/Clothes').aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(userId), createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Fill all 6 months so chart doesn't look empty
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1; // 1-12
      const y = d.getFullYear();
      
      const found = trendData.find(t => t._id.month === m && t._id.year === y);
      formattedTrend.push({
        label: months[m - 1],
        count: found ? found.count : 0
      });
    }

    res.status(200).json({
      data: {
        listings: { active: activeListings, sold: soldItems },
        swaps: { pending: pendingSwaps, completed: completedSwaps },
        donations: { pending: pendingDonations, completed: completedDonations },
        chats: { active: activeChats, unread: unreadCount },
        trend: formattedTrend
      }
    });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('getDashboardStats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user.wishlist) user.wishlist = [];
    
    const index = user.wishlist.indexOf(itemId);
    if (index === -1) {
      user.wishlist.push(itemId);
    } else {
      user.wishlist.splice(index, 1);
    }
    
    await user.save();
    res.status(200).json({ data: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'wishlist',
      populate: { path: 'seller', select: 'name' }
    });
    res.status(200).json({ data: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
};

module.exports = { 
  listUsers, 
  getUserById, 
  updateUserById, 
  deleteUserById, 
  updatePassword, 
  getDashboardStats,
  toggleWishlist,
  getWishlist
};
