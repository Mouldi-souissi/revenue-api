const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deposit: { type: String, required: true },
  previousDeposit: { type: String, required: true },
});

module.exports = mongoose.model("Account", accountSchema);
