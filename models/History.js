const mongoose = require("mongoose");

const account = new mongoose.Schema({
  name: String,
  deposit: String,
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
  amount: String,
});

module.exports = mongoose.model("History", history);
