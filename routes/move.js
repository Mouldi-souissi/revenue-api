const router = require("express").Router();
const Move = require("../models/Move");
const Account = require("../models/Account");
const isAuth = require("../permssions/isAuth");
const isAdmin = require("../permssions/isAdmin");
const mongoose = require("mongoose");
const {
  getTodayRange,
  getYesterdayRange,
  getWeekRange,
  getMonthRange,
} = require("../helpers/dateAndTime");
const History = require("../models/History");
const { MOVE_SUBTYPES, MOVE_TYPES } = require("../constants");
const moveService = require("../services/moveService");

router.get("/:period/:subType", isAuth, async (req, res) => {
  try {
    const { period, subType } = req.params;
    const moves = await moveService.getMovesByPeriod(
      period,
      subType,
      req.user.shopId,
    );
    res.status(200).send(moves);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/revenue/:start/:end/:user", isAuth, async (req, res) => {
  try {
    const { start, end, user } = req.params;
    const revenueData = await moveService.calculateRevenue(
      start,
      end,
      user,
      req.user.shopId,
    );

    res.status(200).send(revenueData);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/", isAuth, async (req, res) => {
  try {
    const move = await moveService.createMove(req.body, req.user);
    res.status(201).send(move);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

router.delete("/:id", isAuth, async (req, res) => {
  try {
    const move = await moveService.deleteMove(req.params.id, req.user);
    res.status(200).send(move);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

// not used
router.put("/:id", isAuth, isAdmin, (req, res) => {
  Move.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((doc) => res.status(200).send(doc))
    .catch((err) => res.status(400).send(err));
});

router.delete("/manual/:id", isAuth, isAdmin, (req, res) => {
  Move.findByIdAndRemove(req.params.id)
    .then(() => res.status(200).send("move deleted"))
    .catch((err) => res.status(400).send(err));
});

module.exports = router;
