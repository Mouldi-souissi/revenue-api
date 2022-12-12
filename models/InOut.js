const mongoose = require("mongoose");

const inOutSchema = new mongoose.Schema({
  deposit: { type: String, required: true },
  sites: [{ name: String, start: String, end: String, rate: String }],
  totalWinners: String,
  totalDepenses: String,
});

module.exports = mongoose.model("InOut", inOutSchema);
