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

router.get("/:period/:subType", isAuth, async (req, res) => {
  try {
    const { period, subType } = req.params;
    const today = new Date();

    let query = {};

    if (period === "daily") {
      const { start, end } = getTodayRange();
      query.date = { $gte: start, $lte: end };
    }
    if (period === "yesterday") {
      const { start, end } = getYesterdayRange();
      query.date = { $gte: start, $lt: end };
    }
    if (period === "weekly") {
      const { start, end } = getWeekRange();
      query.date = { $gte: start, $lt: end };
    }
    if (period === "monthly") {
      const { start, end } = getMonthRange();
      query.date = { $gte: start, $lt: end };
    }
    if (subType && subType != "all") {
      query.subType = subType;
    }

    query.shopId = req.user.shopId;

    const moves = await Move.find(query).sort({ date: -1 });

    res.status(200).send(moves);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/revenue/:start/:end/:user", isAuth, async (req, res) => {
  try {
    const start = req.params.start;
    const end = req.params.end;
    const user = req.params.user;

    let query = {
      shopId: req.user.shopId,
      date: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    };

    if (user && user !== "all") {
      query.user = user;
    }

    const moves = await Move.find(query);

    let totalSales = 0;
    let totalWins = 0;
    let totalSpending = 0;
    let revenue = 0;

    for (move of moves) {
      if (move.subType === MOVE_SUBTYPES.sale) {
        totalSales += Number(move.amount);
      }

      if (move.subType === MOVE_SUBTYPES.win) {
        totalWins += Number(move.amount);
      }

      if (move.subType === MOVE_SUBTYPES.spending) {
        totalSpending += Number(move.amount);
      }
    }

    revenue = totalSales - totalWins - totalSpending;

    res.status(200).send({ totalSales, totalWins, totalSpending, revenue });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/", isAuth, async (req, res) => {
  const session = await mongoose.startSession().catch((err) => {
    console.error("Error starting session:", err);
    return res.status(500).send("Internal server error.");
  });

  if (!session) return; // If session initialization fails

  try {
    if (!req.body) {
      return res.status(400).send("Missing data");
    }

    const { type, amount, account, description, subType, accountId } = req.body;

    const move = new Move({
      type,
      subType,
      amount,
      account,
      description,
      accountId,
      user: req.user.name,
      date: new Date(),
      shop: req.user.shop,
      shopId: req.user.shopId,
      userId: req.user.id,
    });

    await session.startTransaction();

    const doc = await move.save({ session });

    const accounts = await Account.find({ shopId: req.user.shopId }).session(
      session,
    );

    const primaryAccount = accounts.find((acc) => acc.type === "primary");
    const moveAccount = accounts.find((acc) => acc.name === account);

    if (subType === MOVE_SUBTYPES.win) {
      await Account.findByIdAndUpdate(
        moveAccount._id,
        {
          lastMove: { type: MOVE_TYPES.in, amount },
          deposit: Number(moveAccount.deposit) + Number(amount),
        },
        { session },
      );

      await Account.findByIdAndUpdate(
        primaryAccount._id,
        {
          lastMove: { type: MOVE_TYPES.out, amount },
          deposit: Number(primaryAccount.deposit) - Number(amount),
        },
        { session },
      );
    }

    if (subType === MOVE_SUBTYPES.spending) {
      await Account.findByIdAndUpdate(
        primaryAccount._id,
        {
          lastMove: { type: MOVE_TYPES.out, amount },
          deposit: Number(primaryAccount.deposit) - Number(amount),
        },
        { session },
      );
    }

    if (subType === MOVE_SUBTYPES.sale) {
      await Account.findByIdAndUpdate(
        primaryAccount._id,
        {
          lastMove: { type: MOVE_TYPES.in, amount },
          deposit: Number(primaryAccount.deposit) + Number(amount),
        },
        { session },
      );

      const saleAmount = (amount / moveAccount.rate).toFixed(0);

      await Account.findByIdAndUpdate(
        moveAccount._id,
        {
          lastMove: { type: MOVE_TYPES.out, amount: saleAmount },
          deposit: Number(moveAccount.deposit) - Number(saleAmount),
        },
        { session },
      );
    }

    if (subType === MOVE_SUBTYPES.deposit) {
      await Account.findByIdAndUpdate(
        moveAccount._id,
        {
          lastMove: { type: MOVE_TYPES.in, amount },
          deposit: Number(moveAccount.deposit) + Number(amount),
        },
        { session },
      );
    }

    if (subType === MOVE_SUBTYPES.withdraw) {
      await Account.findByIdAndUpdate(
        moveAccount._id,
        {
          lastMove: { type: MOVE_TYPES.out, amount },
          deposit: Number(moveAccount.deposit) - Number(amount),
        },
        { session },
      );
    }

    const accountsAfter = await Account.find({
      shopId: req.user.shopId,
    }).session(session);

    const history = new History({
      moveSubType: subType,
      user: move.user,
      accountsBefore: accounts,
      accountsAfter,
      shop: req.user.shop,
      shopId: req.user.shopId,
      userId: req.user.id,
      amount,
      isUndo: false,
    });

    await history.save({ session });
    await session.commitTransaction();

    return res.send(doc);
  } catch (error) {
    await session.abortTransaction();
    console.error("Transaction failed:", error);
    return res.status(400).send("Transaction failed");
  } finally {
    session.endSession();
  }
});

router.delete("/:id", isAuth, async (req, res) => {
  const session = await mongoose.startSession().catch((err) => {
    console.error("Error starting session:", err);
    return res.status(500).send("Internal server error.");
  });

  if (!session) return; // If session initialization fails

  try {
    if (!req.params.id) {
      return res.status(400).send("Missing id");
    }
    await session.startTransaction();

    const move = await Move.findById(req.params.id).session(session);
    const { subType, amount, account, shop } = move;

    await Move.findByIdAndRemove(req.params.id, { session });
    // update accounts

    const accounts = await Account.find({ shopId: req.user.shopId }).session(
      session,
    );

    const primaryAccount = accounts.find((acc) => acc.type === "primary");
    const moveAccount = accounts.find((acc) => acc.name === account);

    if (subType === MOVE_SUBTYPES.win) {
      await Account.findByIdAndUpdate(
        moveAccount._id,
        {
          lastMove: { type: MOVE_TYPES.out, amount: amount },
          deposit: Number(moveAccount.deposit) - Number(amount),
        },
        { session },
      );

      await Account.findByIdAndUpdate(
        primaryAccount._id,
        {
          lastMove: { type: MOVE_TYPES.in, amount: amount },
          deposit: Number(primaryAccount.deposit) + Number(amount),
        },
        { session },
      );
    }
    if (subType === MOVE_SUBTYPES.spending) {
      await Account.findByIdAndUpdate(
        primaryAccount._id,
        {
          lastMove: { type: MOVE_TYPES.in, amount: amount },
          deposit: Number(primaryAccount.deposit) + Number(amount),
        },
        { session },
      );
    }
    if (subType === MOVE_SUBTYPES.sale) {
      const rate = moveAccount.rate;

      await Account.findByIdAndUpdate(
        primaryAccount._id,
        {
          lastMove: { type: MOVE_TYPES.out, amount: Number(amount) },
          deposit: Number(primaryAccount.deposit) - Number(amount),
        },
        { session },
      );
      await Account.findByIdAndUpdate(
        moveAccount._id,
        {
          lastMove: {
            type: MOVE_TYPES.in,
            amount: (Number(amount) / Number(rate)).toFixed(0),
          },
          deposit:
            Number(moveAccount.deposit) +
            Number((Number(amount) / Number(rate)).toFixed(0)),
        },
        { session },
      );
    }
    if (subType === MOVE_SUBTYPES.deposit) {
      await Account.findByIdAndUpdate(
        moveAccount._id,
        {
          lastMove: { type: MOVE_TYPES.out, amount: Number(amount) },
          deposit: Number(moveAccount.deposit) - Number(amount),
        },
        { session },
      );
    }
    if (subType === MOVE_SUBTYPES.withdraw) {
      await Account.findByIdAndUpdate(
        moveAccount._id,
        {
          lastMove: { type: MOVE_TYPES.in, amount: Number(amount) },
          deposit: Number(moveAccount.deposit) + Number(amount),
        },
        { session },
      );
    }

    const accountsAfter = await Account.find({
      shopId: req.user.shopId,
    }).session(session);

    const history = new History({
      moveSubType: subType,
      user: move.user,
      accountsBefore: accounts,
      accountsAfter,
      shop: req.user.shop,
      shopId: req.user.shopId,
      userId: req.user.id,
      amount,
      isUndo: true,
    });

    await history.save({ session });

    await session.commitTransaction();
    res.status(200).send(move);
  } catch (error) {
    await session.abortTransaction();
    console.error("Transaction failed:", error);
    return res.status(400).send("Transaction failed");
  } finally {
    session.endSession();
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

// router.delete("/", isAuth, isAdmin, (req, res) => {
//   Move.remove({})
//     .then(() => res.status(200).send("moves removed"))
//     .catch((err) => res.status(400).send(err));
// });

// router.get("/sync", isAuth, async (req, res) => {
//   try {
//     const aouinaId = "654ff17b2910fb570bface2c";
//     const ainId = "654ff150a3d963abb8aa17df";

//     await Move.updateMany(
//       { shop: "aouina" },
//       { $set: { shopId: aouinaId, userId: req.user.id } },
//     );

//     await Move.updateMany(
//       { shop: "hamma shop" },
//       { $set: { shopId: ainId, userId: req.user.id } },
//     );

//     res.status(200).send("sync done");
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

module.exports = router;
