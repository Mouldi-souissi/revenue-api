const User = require("../models/User");
const database = require("../db/database");

class UserRepository {
  async findByEmail(email) {
    return database.readOne(User, { email });
  }

  async findById(id) {
    return database.readOne(User, { _id: id });
  }

  async findByShopId(shopId) {
    return database.read(
      User,
      { shopId },
      { select: { password: 0 }, sort: { _id: -1 } },
    );
  }

  async create(userData) {
    return database.create(User, userData);
  }

  async updateById(id, updateData) {
    return database.update(User, { _id: id }, updateData);
  }

  async deleteById(id) {
    return database.delete(User, { _id: id });
  }
}

module.exports = new UserRepository();
