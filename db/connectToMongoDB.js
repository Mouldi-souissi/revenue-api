const mongoose = require("mongoose");
require("dotenv").config();

const connectToMongoDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB is connected");
  } catch (err) {
    console.error("Failed to connect to the database:", err.message);
  }
};

module.exports = connectToMongoDB;
