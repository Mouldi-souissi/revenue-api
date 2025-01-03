const jwt = require("jsonwebtoken");
const tokenVersion = require("../tokenVersion");

require("dotenv").config();

const claims = {
  id: "testUserId",
  name: "Test User",
  type: "admin",
  shop: "Test Shop",
  shopId: "testShopId",
  tokenVersion,
};

const signToken = (claims = defaultClaims, validity = "2h") => {
  return jwt.sign(claims, process.env.JWTsecret, { expiresIn: validity });
};

const decodeToken = (token) => {
  return jwt.verify(token, process.env.JWTsecret);
};

module.exports = { signToken, decodeToken };
