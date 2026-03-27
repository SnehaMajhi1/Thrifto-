class ClothesDTO {
  constructor(clothes) {
    this._id = clothes._id;
    this.title = clothes.title;
    this.description = clothes.description;
    this.category = clothes.category;
    this.price = clothes.price;
    this.images = clothes.images;
    this.seller = clothes.seller;
    this.listingType = clothes.listingType;
    this.status = clothes.status;
    this.location = clothes.location;
    this.createdAt = clothes.createdAt;
  }
}

module.exports = ClothesDTO;
