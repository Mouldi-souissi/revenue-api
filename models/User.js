const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { type: String, required: true },
  shop: { type: String, default: "aouina" },
  shopId: String,
});

module.exports = mongoose.model("user", userSchema);
