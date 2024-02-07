const mongoose = require("mongoose");

const history = new mongoose.Schema({
  date: { type: Date },
  shop: { type: String, default: "aouina" },
  accountFond: { type: String },
  accountBet: { type: String },
  accountMax: { type: String },
});

module.exports = mongoose.model("History", history);
