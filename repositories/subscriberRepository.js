const Subscriber = require("../models/Subscriber");

class SubscriberRepository {
  async createOrUpdate(userId, subscription, shopId, isActive) {
    return Subscription.findByIdAndUpdate(
      userId,
      { subscription, isActive, shopId },
      { upsert: true },
    );
  }

  async findActive(shopId, userId) {
    return Subscription.find({ shopId, isActive: true, _id: { $ne: userId } });
  }

  async Delete(id) {
    return Subscription.findByIdAndDelete(id);
  }
}

module.exports = new SubscriberRepository();
