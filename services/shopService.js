const shopRepository = require("../repositories/shopRepository");

class ShopService {
  async createShop(payload) {
    return shopRepository.create(payload);
  }

  async getAllShops() {
    return shopRepository.findAll();
  }

  async getShopById(id) {
    return shopRepository.findById(id);
  }

  async updateShop(id, updateData) {
    return shopRepository.updateById(id, updateData);
  }

  async deleteShop(id) {
    return shopRepository.deleteById(id);
  }
}

module.exports = new ShopService();
