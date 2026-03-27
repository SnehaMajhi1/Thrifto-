const Clothes = require('../models/Clothes');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');


const listClothes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      listingType,
      status = 'available',
      minPrice,
      maxPrice,
      search,
      seller,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by listing type
    if (listingType) {
      query.listingType = listingType;
    }

    // Filter by seller
    if (seller) {
      query.seller = seller;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Clothes.find(query)
        .populate('seller', 'name email profilePicture')
        .limit(parseInt(limit))
        .skip(skip)
        .sort(sort),
      Clothes.countDocuments(query)
    ]);

    return res.status(200).json({
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('List clothes error:', error);
    return res.status(500).json({ message: 'Failed to fetch clothes items', error: error.message, stack: error.stack });
  }
};

const createClothes = async (req, res) => {
  try {
    const itemData = req.body;

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      itemData.images = req.files.map(f => `/uploads/${f.filename}`);
    } else if (itemData.images && typeof itemData.images === 'string') {
      itemData.images = itemData.images.split(',').map(url => url.trim()).filter(Boolean);
    }

    // Set seller to current user
    itemData.seller = req.userId;

    // Validate auction end date if listing type is auction
    if (itemData.listingType === 'auction') {
      if (!itemData.auctionEndDate) {
        return res.status(400).json({ message: 'Auction end date is required for auction listings' });
      }
      if (new Date(itemData.auctionEndDate) <= new Date()) {
        return res.status(400).json({ message: 'Auction end date must be in the future' });
      }
    }

    const item = await Clothes.create(itemData);
    await item.populate('seller', 'name email profilePicture');

    // Log activity
    await logActivity(req.userId, `added a new listing: ${item.title}`, 'item', `Type: ${item.listingType}`, item._id);

    return res.status(201).json({ data: item });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Create clothes error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Failed to create clothes item' });
  }
};

const getClothesById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Clothes.findById(id).populate('seller', 'name email profilePicture phone');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment view count
    item.views += 1;
    await item.save();

    return res.status(200).json({ data: item });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get clothes error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    return res.status(500).json({ message: 'Failed to fetch item' });
  }
};

const updateClothesById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(f => `/uploads/${f.filename}`);
    } else if (updates.images && typeof updates.images === 'string') {
      updates.images = updates.images.split(',').map(url => url.trim()).filter(Boolean);
    }

    // Find item first to check ownership
    const item = await Clothes.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only seller or admin can update
    if (item.seller.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only update your own items' });
    }

    // Don't allow updating certain fields
    delete updates.seller;
    delete updates.views;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updated = await Clothes.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('seller', 'name email profilePicture');

    // Log activity
    await logActivity(req.userId, `updated listing: ${updated.title}`, 'item', '', updated._id);

    return res.status(200).json({ data: updated });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Update clothes error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    return res.status(500).json({ message: 'Failed to update item' });
  }
};

const deleteClothesById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Clothes.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only seller or admin can delete
    if (item.seller.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own items' });
    }

    await Clothes.findByIdAndDelete(id);

    // Log activity
    await logActivity(req.userId, `deleted listing: ${item.title}`, 'item', '', id);

    return res.status(200).json({ message: 'Item deleted successfully' });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Delete clothes error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item ID' });
    }
    return res.status(500).json({ message: 'Failed to delete item' });
  }
};

const ClothesService = require('../services/ClothesService');

const getNearby = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const items = await ClothesService.getNearbyItems(req.userId, limit);
    return res.status(200).json({ data: items });
  } catch (error) {
    console.error('Get nearby error:', error);
    return res.status(500).json({ message: 'Failed to fetch nearby items' });
  }
};

const getRecommended = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const items = await ClothesService.getRecommendedItems(req.userId, limit);
    return res.status(200).json({ data: items });
  } catch (error) {
    console.error('Get recommended error:', error);
    return res.status(500).json({ message: 'Failed to fetch recommended items' });
  }
};

module.exports = {
  listClothes,
  createClothes,
  getClothesById,
  updateClothesById,
  deleteClothesById,
  getNearby,
  getRecommended
};
