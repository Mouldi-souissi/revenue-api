const router = require("express").Router();
const Move = require("../models/Move");
const User = require("../models/User");
const Shop = require("../models/Shop");
const Account = require("../models/Account");
const History = require("../models/History");

const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

const InternalServerError = require("../errors/InternalServerError");

/**
 * @swagger
 * /backup:
 *   get:
 *     summary: Get full backup dump (admin only)
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Full data dump including users, moves, shops, accounts, history
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin required
 */

router.get("/", isAuth, isAdmin, async (req, res, next) => {
  try {
    const users = await User.find();
    const shops = await Shop.find();
    const accounts = await Account.find();
    const history = await History.find();
    const moves = await Move.find();

    res
      .status(200)
      .send({ users, moves, shops, accounts, history, date: new Date() });
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

module.exports = router;
