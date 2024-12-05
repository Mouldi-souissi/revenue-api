const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deposit: { type: String, default: "0", required: true },
  lastUpdated: { type: Date, default: () => new Date() },
  lastMove: {
    type: { type: String, default: "" },
    amount: { type: String, default: "0" },
  },
  rate: { type: String, default: "1" },
  shop: { type: String, default: "aouina" },
  shopId: String,
  type: { type: String, default: "secondary" },
});

module.exports = mongoose.model("Account", accountSchema);
