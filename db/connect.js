const mongoose = require("mongoose");
require("dotenv").config();

const connect = async () => {
  try {
    mongoose.set("strictQuery", true).connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" DB is connected");
  } catch (err) {
    console.error(err);
  }
};

module.exports = connect;
