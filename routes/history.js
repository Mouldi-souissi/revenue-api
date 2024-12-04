const router = require("express").Router();
const History = require("../models/History");
const isAuth = require("../permssions/isAuth");

router.get("/", isAuth, async (req, res) => {
  try {
    const history = await History.find({ shop: req.user.shop }).sort({
      date: -1,
    });
    res.status(200).send(history);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
