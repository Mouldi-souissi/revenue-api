const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenVersion = require("../tokenVersion");
require("dotenv").config();

class UserService {
  async register(userData, currentUser) {
    const { name, email, type, password } = userData;

    if (!name || !email || !type || !password) {
      throw new Error("Invalid payload");
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    if (!email || !password) {
      throw new Error("Invalid payload");
    }

    const user = await userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        type: user.type,
        shop: user.shop,
        shopId: user.shopId,
        tokenVersion,
      },
      process.env.JWTsecret,
      { expiresIn: "2h" },
    );

    return token;
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
