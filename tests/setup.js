const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { signToken } = require("../helpers/token");
const tokenVersion = require("../tokenVersion");

let mongoServer;

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
};

const dropDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

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

module.exports = { connectDB, disconnectDB, dropDB, getMockToken };
