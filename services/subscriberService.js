const subscriberRepository = require("../repositories/subscriberRepository");
const webpush = require("web-push");
require("dotenv").config();
// VAPID Keys
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const notificationEmail = process.env.NOTIFICATION_EMAIL;

// Set VAPID details
webpush.setVapidDetails(
  `mailto:${notificationEmail}`,
  publicVapidKey,
  privateVapidKey,
);

class SubscriberService {
  async createOrUpdate(userId, subscription, shopId, isActive) {
    return subscriberRepository.createOrUpdate(
      userId,
      subscription,
      shopId,
      isActive,
    );
  }

  async notify(title, message, shopId, userId) {
    const subscribers = await subscriberRepository
      .findActive(shopId, userId)
      .catch((err) => {
        throw Error("failed to find active subscribers", err);
      });

    for (let subscriber of subscribers) {
      const payload = JSON.stringify({ title, body: message });
      await webpush.sendNotification(sub.subscription, payload).catch((err) => {
        throw Error("failed to send norification", err);
      });
    }
    return;
  }

  async delete(id) {
    return subscriberRepository.delete(id);
  }
}

module.exports = new SubscriberService();
