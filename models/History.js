const mongoose = require("mongoose");

const account = new mongoose.Schema({
  name: String,
  deposit: Number,
});

const history = new mongoose.Schema({
  date: {
    type: Date,
    default: () => new Date(),
  },
  shop: { type: String, default: "aouina" },
  accountsBefore: [account],
  accountsAfter: [account],
  moveSubType: String,
  user: String,
  isUndo: { type: Boolean, default: false },
  amount: Number,
  shopId: String,
  userId: String,
});

module.exports = mongoose.model("History", history);
