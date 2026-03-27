const Clothes = require('../models/Clothes');
const User = require('../models/User');
const Activity = require('../models/Activity');

class ClothesRepository {
  async findNearby(city, limit) {
    return await Clothes.find({ 'location.city': { $regex: new RegExp(city, 'i') }, status: 'available' })
      .populate('seller', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async findRecommended(userId, limit) {
    // Basic recommendation heuristic: find what the user interacted with often or fallback to most recent active items
    const userActivities = await Activity.find({ user: userId, type: 'item' }).limit(20).sort({ createdAt: -1 });
    // If no specific activity, just recommend newly published available items
    return await Clothes.find({ seller: { $ne: userId }, status: 'available' })
      .populate('seller', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new ClothesRepository();
