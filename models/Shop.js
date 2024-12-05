const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true, default: "aouina" },
  address: { type: String, default: "aouina" },
});

module.exports = mongoose.model("shop", shopSchema);
