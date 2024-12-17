const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const subscriberService = require("../services/subscriberService");
const InternalServerError = require("../errors/InternalServerError");

router.post("/", isAuth, async (req, res) => {
  try {
    const { subscription } = req.body;
    const { id, shopId } = req.user;

    await subscriberService.createOrUpdate(id, subscription, shopId, true);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

router.post("/notification", isAuth, async (req, res) => {
  try {
    const { title, message } = req.body;
    const { id, shopId } = req.user;

    await subscriberService.notify(title, message, shopId, id);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

module.exports = router;
