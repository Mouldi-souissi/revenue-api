const database = require("../db/database");
const Move = require("../models/Move");
const Account = require("../models/Account");
const History = require("../models/History");
const Shop = require("../models/Shop");
const User = require("../models/User");
const { USER_ROLES, ACCOUNT_TYPES } = require("../constants");
const { hashPassword } = require("../helpers/encryption");
const tokenVersion = require("../tokenVersion");
const { signToken } = require("../helpers/token");
require("dotenv").config();
const mongoose = require("mongoose");

const initDB = async () => {
  try {
    // create shop
    const shop = await Shop.create({
      name: "test shop",
      address: "test address",
    });

    // add two users
    const hashedPassword = await hashPassword("123456");
    const admin = await User.create({
      name: "admin",
      email: "admin@mail.com",
      password: hashedPassword,
      type: USER_ROLES.ADMIN,
      shop: shop.name,
      shopId: shop._id,
    });

    const adminToken = await signToken(
      {
        id: admin._id,
        name: admin.name,
        type: admin.role,
        shop: admin.shop,
        shopId: admin.shopId,
        tokenVersion,
      },
      "2h",
    );

    const user = await User.create({
      name: "user",
      email: "user@mail.com",
      password: hashedPassword,
      type: USER_ROLES.USER,
      shop: shop.name,
      shopId: shop._id,
    });

    const userToken = await signToken({
      id: user._id,
      name: user.name,
      type: user.role,
      shop: user.shop,
      shopId: user.shopId,
      tokenVersion,
    });

    // add two accounts
    const primary = {
      name: "primary",
      deposit: 1000,
      rate: 1,
      shop: shop.name,
      shopId: shop._id,
      type: ACCOUNT_TYPES.primary,
    };

    const secondary = {
      name: "secondary",
      deposit: 1000,
      rate: 1.2,
      shop: shop.name,
      shopId: shop._id,
      type: ACCOUNT_TYPES.secondary,
    };
    const primaryAccount = await Account.create(primary);
    const secondaryAccount = await Account.create(secondary);

    return {
      shop,
      user,
      admin,
      adminToken,
      userToken,
      primaryAccount,
      secondaryAccount,
    };
  } catch (err) {
    console.log(err);
  }
};

const connect = async () => {
  // if (mongoose.connection.readyState === 0) {
  await database.connect(process.env.DB_TEST);
  await initDB();
  // }
};

const disconnect = async () => {
  await database.disconnect();
};

const dropDB = async () => {
  await database.drop();
};

module.exports = {
  connect,
  disconnect,
  dropDB,
};
