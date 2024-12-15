const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deposit: { type: Number, default: 0, required: true },
  lastUpdated: { type: Date, default: () => new Date() },
  lastMove: {
    type: { type: String, default: "" },
    amount: { type: Number, default: 0 },
  },
  rate: { type: Number, default: 1 },
  shop: { type: String, default: "aouina" },
  shopId: String,
  type: { type: String, default: "secondary" },
});

module.exports = mongoose.model("Account", accountSchema);
