const mongoose = require("mongoose");

const moveSchema = new mongoose.Schema({
  type: { type: String, required: true }, //in or out
  subType: { type: String, required: true }, //win spending sale
  amount: { type: String, required: true },
  account: { type: String, required: true },
  description: { type: String },
  user: { type: String, required: true },
  date: { type: Date, default: new Date() },
  shop: { type: String, default: "aouina" },
});

module.exports = mongoose.model("Move", moveSchema);
