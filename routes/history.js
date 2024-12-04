const router = require("express").Router();
const History = require("../models/History");
const isAuth = require("../permssions/isAuth");

router.get("/:start/:end", isAuth, async (req, res) => {
  try {
    const start = req.params.start;
    const end = req.params.end;

    if (!start || !end) {
      return res.status(400).send("invalid time interval");
    }

    const history = await History.find({
      shop: req.user.shop,
      date: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    }).sort({
      date: -1,
    });
    res.status(200).send(history);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
