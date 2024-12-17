const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
  _id: String,
  subscription: Object,
  isActive: Boolean,
  shopId: String,
});

module.exports = mongoose.model("Subscriber", subscriberSchema);
