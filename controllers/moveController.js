const router = require("express").Router();
const Move = require("../models/Move");
const Account = require("../models/Account");
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const mongoose = require("mongoose");
const {
  getTodayRange,
  getYesterdayRange,
  getWeekRange,
  getMonthRange,
} = require("../helpers/dateAndTime");
const History = require("../models/History");
const { MOVE_SUBTYPES, MOVE_TYPES, PERIOD_VALUES } = require("../constants");
const moveService = require("../services/moveService");

const InternalServerError = require("../errors/InternalServerError");
const BadRequestError = require("../errors/BadRequestError");

router.get("/:period/:subType", isAuth, async (req, res, next) => {
  try {
    const { period, subType } = req.params;

    if (!period || !subType) {
      return next(new BadRequestError("invalid params"));
    }

    const moves = await moveService.getMovesByPeriod(
      period,
      subType,
      req.user.shopId,
    );
    res.status(200).send(moves);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

router.get("/revenue/:start/:end/:user", isAuth, async (req, res, next) => {
  try {
    const { start, end, user } = req.params;

    if (!start || !end || !user) {
      return next(new BadRequestError("invalid params"));
    }

    const revenueData = await moveService.calculateRevenue(
      start,
      end,
      user,
      req.user.shopId,
    );

    res.status(200).send(revenueData);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

router.post("/", isAuth, async (req, res, next) => {
  try {
    const { type, subType, amount, account, accountId, description } = req.body;

    if (!type || !subType || !amount || !account || !accountId) {
      return next(new BadRequestError("invalid payload"));
    }

    const move = await moveService.createMove(
      { type, subType, amount, account, accountId, description },
      req.user,
    );
    res.status(201).send(move);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

router.delete("/:id", isAuth, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id) {
      return next(new BadRequestError("missing id"));
    }
    const move = await moveService.deleteMove(id, req.user);
    res.status(200).send(move);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

// not used
router.put("/:id", isAuth, isAdmin, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id) {
      return next(new BadRequestError("missing id"));
    }
    const move = await Move.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).send(move);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

router.delete("/manual/:id", isAuth, isAdmin, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id) {
      return next(new BadRequestError("missing id"));
    }
    await Move.findByIdAndRemove(id);
    res.status(200).send("move deleted");
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

module.exports = router;
