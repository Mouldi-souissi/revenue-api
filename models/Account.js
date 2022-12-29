const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deposit: { type: String, default: "0", required: true },
  img: { type: String },
  lastUpdated: { type: Date },
});

module.exports = mongoose.model("Account", accountSchema);
