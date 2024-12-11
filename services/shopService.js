const shopRepository = require("../repositories/shopRepository");

class ShopService {
  async createShop(shopData) {
    if (!shopData.name) {
      throw new Error("Shop name is required");
    }
    return shopRepository.create(shopData);
  }

  async getAllShops() {
    return shopRepository.findAll();
  }

  async getShopById(shopId) {
    if (!shopId) {
      throw new Error("Shop ID is required");
    }
    const shop = await shopRepository.findById(shopId);
    if (!shop) {
      throw new Error("Shop not found");
    }
    return shop;
  }

  async updateShop(shopId, updateData) {
    if (!shopId) {
      throw new Error("Shop ID is required");
    }
    return shopRepository.updateById(shopId, updateData);
  }

  async deleteShop(shopId) {
    if (!shopId) {
      throw new Error("Shop ID is required");
    }
    return shopRepository.deleteById(shopId);
  }
}

module.exports = new ShopService();
