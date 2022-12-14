const mongoose = require("mongoose");

const inOutSchema = new mongoose.Schema({
  depositStart: { type: String, required: true },
  depositEnd: { type: String, required: true },
  sites: [{ name: String, start: String, end: String, rate: String }],
  totalWins: { type: String, required: true },
  totalDepenses: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InOut", inOutSchema);
