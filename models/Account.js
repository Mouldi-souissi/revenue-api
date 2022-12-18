const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deposit: { type: String, default: "0", required: true },
  lastMove: {
    type: { type: String, default: "" },
    amount: { type: String, default: "0" },
  },
  rate: { type: String, default: "1" },
  img: { type: String },
});

module.exports = mongoose.model("Account", accountSchema);
