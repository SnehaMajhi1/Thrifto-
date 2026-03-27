const User = require('../models/User');
const Clothes = require('../models/Clothes');
const Post = require('../models/Post');
const Donation = require('../models/Donation');
const Swap = require('../models/Swap');
const Bid = require('../models/Bid');
const Activity = require('../models/Activity');
const Message = require('../models/Message');


const getStats = async (req, res) => {
  try {
    // Get counts
    const [usersCount, clothesCount, postsCount, donationsCount, swapsCount, bidsCount] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Clothes.countDocuments(),
      Post.countDocuments(),
      Donation.countDocuments(),
      Swap.countDocuments(),
      Bid.countDocuments()
    ]);

    // Get recent activities
    const [recentUsers, recentClothes, recentDonations, recentSwaps] = await Promise.all([
      User.find({ isActive: true }).select('name email createdAt').sort({ createdAt: -1 }).limit(5),
      Clothes.find().populate('seller', 'name').select('title status createdAt').sort({ createdAt: -1 }).limit(5),
      Donation.find().populate('donor', 'name').select('status createdAt').sort({ createdAt: -1 }).limit(5),
      Swap.find().populate('requester requestedFrom', 'name').select('status createdAt').sort({ createdAt: -1 }).limit(5)
    ]);

    // Status breakdown
    const [clothesStatusBreakdown, donationStatusBreakdown, swapStatusBreakdown] = await Promise.all([
      Clothes.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Donation.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Swap.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // Revenue (total value of sold items)
    const revenueData = await Clothes.aggregate([
      { $match: { status: 'sold' } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // EcoPoints statistics
    const ecoPointsData = await User.aggregate([
      { $group: { _id: null, totalEcoPoints: { $sum: '$ecoPoints' } } }
    ]);

    const totalEcoPoints = ecoPointsData.length > 0 ? ecoPointsData[0].totalEcoPoints : 0;

    // Top contributors (by EcoPoints)
    const topContributors = await User.find({ isActive: true })
      .select('name email ecoPoints')
      .sort({ ecoPoints: -1 })
      .limit(10);

    return res.status(200).json({
      data: {
        counts: {
          users: usersCount,
          clothes: clothesCount,
          posts: postsCount,
          donations: donationsCount,
          swaps: swapsCount,
          bids: bidsCount
        },
        recent: {
          users: recentUsers,
          clothes: recentClothes,
          donations: recentDonations,
          swaps: recentSwaps
        },
        breakdown: {
          clothesStatus: clothesStatusBreakdown,
          donationStatus: donationStatusBreakdown,
          swapStatus: swapStatusBreakdown
        },
        financial: {
          totalRevenue
        },
        ecoPoints: {
          total: totalEcoPoints,
          topContributors
        }
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get stats error:', error);
    return res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, user } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (user) query.user = user;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('user', 'name email profilePicture')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 }),
      Activity.countDocuments(query)
    ]);

    return res.status(200).json({
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    return res.status(500).json({ message: 'Failed to fetch activities' });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      Message.find()
        .populate('sender_id', 'name email profilePicture')
        .populate('receiver_id', 'name email profilePicture')
        .populate({
          path: 'chat',
          populate: { path: 'participants', select: 'name email' }
        })
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ timestamp: -1 }),
      Message.countDocuments()
    ]);

    return res.status(200).json({
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all messages error:', error);
    return res.status(500).json({ message: 'Failed to fetch all messages' });
  }
};

const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;
    
    const user = await User.findByIdAndUpdate(id, { isBanned }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const [userGrowth, activityTrend] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { 
          $group: { 
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Activity.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { 
          $group: { 
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ])
    ]);

    res.status(200).json({ data: { userGrowth, activityTrend } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

module.exports = { getStats, getActivities, getAllMessages, banUser, getAnalytics };

