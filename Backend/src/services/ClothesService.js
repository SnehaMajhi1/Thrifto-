const ClothesRepository = require('../repositories/ClothesRepository');
const ClothesDTO = require('../dtos/ClothesDTO');
const User = require('../models/User');

class ClothesService {
  async getNearbyItems(userId, limit = 10) {
    const user = await User.findById(userId);
    if (!user || !user.address || !user.address.city) {
      return []; // Return empty if no location recorded yet
    }
    const items = await ClothesRepository.findNearby(user.address.city, Number(limit));
    return items.map(item => new ClothesDTO(item));
  }

  async getRecommendedItems(userId, limit = 10) {
    const items = await ClothesRepository.findRecommended(userId, Number(limit));
    return items.map(item => new ClothesDTO(item));
  }
}

module.exports = new ClothesService();
