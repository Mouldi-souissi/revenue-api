const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rate: { type: String, default: "1" },
  img: { type: String },
});

module.exports = mongoose.model("Site", siteSchema);
