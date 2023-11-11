const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true, default: "aouina" },
  adress: { type: String, default: "aouina" },
});

module.exports = mongoose.model("shop", shopSchema);
