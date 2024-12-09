const router = require("express").Router();
const Move = require("../models/Move");
const User = require("../models/User");
const Shop = require("../models/Shop");
const Account = require("../models/Account");
const History = require("../models/History");

const isAuth = require("../permssions/isAuth");
const isAdmin = require("../permssions/isAdmin");

router.get("/", isAuth, isAdmin, async (req, res) => {
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
    console.log(err);
    res.status(400).send(err);
  }
});

module.exports = router;
