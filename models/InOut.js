const mongoose = require("mongoose");

const inOutSchema = new mongoose.Schema({
  type: { type: String, required: true }, //in or out
  subType: { type: String, required: true }, //win or spending
  amount: { type: String, required: true },
  account: { type: String, required: true },
  description: { type: String, required: true },
  user: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InOut", inOutSchema);
