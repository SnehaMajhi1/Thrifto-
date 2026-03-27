const Swap = require('../models/Swap');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');
const { sendNotification } = require('../utils/notificationHelper');

const Clothes = require('../models/Clothes');

const listSwaps = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status
    } = req.query;

    // Users can see swaps they're involved in, admins can see all
    const query = req.userRole === 'admin' ? {} : {
      $or: [
        { requester: req.userId },
        { requestedFrom: req.userId }
      ]
    };

    // Filter by status
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [swaps, total] = await Promise.all([
      Swap.find(query)
        .populate('requester', 'name email profilePicture')
        .populate('requestedFrom', 'name email profilePicture')
        .populate('offeredItems', 'title images price')
        .populate('requestedItems', 'title images price')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 }),
      Swap.countDocuments(query)
    ]);

    return res.status(200).json({
      data: swaps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('List swaps error:', error);
    return res.status(500).json({ message: 'Failed to fetch swaps' });
  }
};

const createSwap = async (req, res) => {
  try {
    const swapData = req.body;

    // Set requester to current user
    swapData.requester = req.userId;

    // Validate required fields
    if (!swapData.requestedFrom) {
      return res.status(400).json({ message: 'requestedFrom user is required' });
    }

    if (!swapData.offeredItems || swapData.offeredItems.length === 0) {
      return res.status(400).json({ message: 'At least one offered item is required' });
    }

    if (!swapData.requestedItems || swapData.requestedItems.length === 0) {
      return res.status(400).json({ message: 'At least one requested item is required' });
    }

    // Verify all offered items belong to requester
    const offeredItems = await Clothes.find({
      _id: { $in: swapData.offeredItems },
      seller: req.userId,
      status: 'available'
    });

    if (offeredItems.length !== swapData.offeredItems.length) {
      return res.status(400).json({ message: 'Some offered items are invalid or not available' });
    }

    // Verify all requested items belong to requestedFrom user
    const requestedItems = await Clothes.find({
      _id: { $in: swapData.requestedItems },
      seller: swapData.requestedFrom,
      status: 'available'
    });

    if (requestedItems.length !== swapData.requestedItems.length) {
      return res.status(400).json({ message: 'Some requested items are invalid or not available' });
    }

    const swap = await Swap.create(swapData);
    await swap.populate('requester requestedFrom offeredItems requestedItems');

    // For notification, pick the first item from each list
    const itemOffered = offeredItems[0];
    const itemRequested = requestedItems[0];

    // Log activity and send notification
    const sender = await User.findById(req.userId);
    await sendNotification(itemRequested.seller, 'swap_request', `${sender.name} proposed a swap for your ${itemRequested.title}`, req.userId, swap._id);
    
    await logActivity(req.userId, `proposed a swap for: ${itemRequested.title}`, 'item', `Swap ID: ${swap._id}`, swap._id);

    return res.status(201).json({ data: swap });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Create swap error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Failed to create swap request' });
  }
};

const updateSwapById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const swap = await Swap.findById(id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Only requestedFrom user can accept/reject
    if (status === 'accepted' || status === 'rejected') {
      if (swap.requestedFrom.toString() !== req.userId) {
        return res.status(403).json({ message: 'Only the requested user can accept or reject' });
      }
    }

    // Both users can cancel
    if (status === 'cancelled') {
      if (swap.requester.toString() !== req.userId && swap.requestedFrom.toString() !== req.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    // Both users can mark as completed
    if (status === 'completed') {
      if (swap.requester.toString() !== req.userId && swap.requestedFrom.toString() !== req.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Award EcoPoints to both users
      const ecoPointsPerUser = 10; // Points for completing a swap

      await Promise.all([
        User.findByIdAndUpdate(swap.requester, { $inc: { ecoPoints: ecoPointsPerUser } }),
        User.findByIdAndUpdate(swap.requestedFrom, { $inc: { ecoPoints: ecoPointsPerUser } })
      ]);

      swap.ecoPointsAwarded = {
        requester: ecoPointsPerUser,
        requestedFrom: ecoPointsPerUser
      };
      swap.completedAt = new Date();

      // Update item statuses
      await Promise.all([
        Clothes.updateMany(
          { _id: { $in: swap.offeredItems } },
          { $set: { status: 'sold' } }
        ),
        Clothes.updateMany(
          { _id: { $in: swap.requestedItems } },
          { $set: { status: 'sold' } }
        )
      ]);
    }

    swap.status = status;
    await swap.save();

    await swap.populate([
      { path: 'requester', select: 'name email ecoPoints' },
      { path: 'requestedFrom', select: 'name email ecoPoints' },
      { path: 'offeredItems', select: 'title images status' },
      { path: 'requestedItems', select: 'title images status' }
    ]);

    // Send notification about status update
    if (status === 'accepted' || status === 'rejected' || status === 'completed' || status === 'cancelled') {
      const recipientId = (req.userId === swap.requester._id.toString()) ? swap.requestedFrom._id : swap.requester._id;
      await sendNotification(recipientId, 'swap_request', `The swap request for ${swap.requestedItems[0]?.title || 'item'} has been ${status}.`, req.userId, swap._id);
    }

    return res.status(200).json({ data: swap, message: 'Swap status updated successfully' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Update swap error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid swap ID' });
    }

    return res.status(500).json({ message: 'Failed to update swap' });
  }
};

module.exports = { listSwaps, createSwap, updateSwapById };
