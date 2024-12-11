const Shop = require("../models/Shop");

class ShopRepository {
  async create(shopData) {
    const shop = new Shop(shopData);
    return shop.save();
  }

  async findAll() {
    return Shop.find().sort({ _id: -1 });
  }

  async findById(shopId) {
    return Shop.findById(shopId);
  }

  async updateById(shopId, updateData) {
    return Shop.findByIdAndUpdate(shopId, updateData, { new: true });
  }

  async deleteById(shopId) {
    return Shop.findByIdAndDelete(shopId);
  }
}

module.exports = new ShopRepository();
