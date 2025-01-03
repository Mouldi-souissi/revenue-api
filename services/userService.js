const userRepository = require("../repositories/userRepository");
const tokenVersion = require("../tokenVersion");
const { signToken } = require("../helpers/token");
const { hashPassword, comparePasswords } = require("../helpers/encryption");
const BadRequestError = require("../errors/BadRequestError");

class UserService {
  async register(userData, currentUser) {
    const { name, email, type, password } = userData;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError("Email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      type,
      shop: currentUser.shop,
      shopId: currentUser.shopId,
    };

    return userRepository.create(newUser);
  }

  async login(userData) {
    const { email, password } = userData;

    const user = await userRepository.findByEmail(email);
    const isValidPassword = await comparePasswords(password, user.password);
    if (!user || !isValidPassword) {
      throw new BadRequestError("Invalid credentials");
    }

    const claims = {
      id: user._id,
      name: user.name,
      type: user.type,
      shop: user.shop,
      shopId: user.shopId,
      tokenVersion,
    };

    return signToken(claims, "2h");
  }

  async getUsers(shopId) {
    return userRepository.findByShopId(shopId);
  }

  async deleteUser(userId) {
    return userRepository.deleteById(userId);
  }

  async updateUser(userId, updateData) {
    return userRepository.updateById(userId, updateData);
  }
}

module.exports = new UserService();
