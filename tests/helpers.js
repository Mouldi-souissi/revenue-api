const { signToken } = require("../helpers/token");
const tokenVersion = require("../tokenVersion");

const getMockToken = (role = "admin") => {
  return signToken({
    id: "testUserId",
    name: "Test User",
    type: role,
    shop: "Test Shop",
    shopId: "testShopId",
    tokenVersion,
  });
};

module.exports = {
  getMockToken,
};
