const User = require("../models/User");

class UserRepository {
  async findByEmail(email) {
    return User.findOne({ email });
  }

  async findById(id) {
    return User.findById(id);
  }

  async findByShopId(shopId) {
    return User.find({ shopId }).select({ password: 0 }).sort({ _id: -1 });
  }

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteById(id) {
    return User.findByIdAndRemove(id);
  }
}

module.exports = new UserRepository();
