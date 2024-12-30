const Shop = require("../models/Shop");
const database = require("../db/database");

class ShopRepository {
  async create(shopData) {
    return database.create(Shop, shopData);
  }

  async findAll() {
    return database.read(Shop, {}, { sort: { _id: -1 } });
  }

  async findById(shopId) {
    return database.readOne(Shop, { _id: shopId });
  }

  async updateById(shopId, updateData) {
    return database.update(Shop, { _id: shopId }, updateData);
  }

  async deleteById(shopId) {
    return database.delete(Shop, { _id: shopId });
  }
}

module.exports = new ShopRepository();
