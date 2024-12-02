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

router.get("/revenue/:start/:end/:user", isAuth, async (req, res) => {
  try {
    const start = req.params.start;
    const end = req.params.end;
    const user = req.params.user;

    let query = {
      shop: req.user.shop,
      date: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    };

    if (user && user !== "all") {
      query = { ...query, user: user };
    }

    const moves = await Move.find(query);

    let totalSales = 0;
    let totalWins = 0;
    let totalSpending = 0;
    let revenue = 0;

    for (move of moves) {
      if (move.subType === "vente") {
        totalSales += Number(move.amount);
      }

      if (move.subType === "gain") {
        totalWins += Number(move.amount);
      }

      if (move.subType === "dépense") {
        totalSpending += Number(move.amount);
      }
    }

    revenue = totalSales - totalWins - totalSpending;

    res.status(200).send({ totalSales, totalWins, totalSpending, revenue });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/wins", isAuth, (req, res) => {
  const { start, end } = getTodayRange();

  Move.find({
    type: "sortie",
    subType: "gain",
    date: {
      $gte: start,
      $lte: end,
    },
    shop: req.user.shop,
  })
    .sort({ date: -1 })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.get("/totalWins/:account", isAuth, (req, res) => {
  const { start, end } = getTodayRange();

  Move.find({
    type: "sortie",
    subType: "gain",
    account: req.params.account,
    date: {
      $gte: start,
      $lte: end,
    },
    shop: req.user.shop,
  })
    .sort({ date: -1 })
    .then((docs) => {
      const totalWins = docs.reduce(
        (acc, curr) => (acc += Number(curr.amount)),
        0,
      );

      res.json(totalWins);
    })
    .catch((err) => res.status(400).send(err));
});

router.get("/sales", isAuth, (req, res) => {
  const { start, end } = getTodayRange();

  Move.find({
    type: "entrée",
    subType: "vente",
    date: {
      $gte: start,
      $lte: end,
    },
    shop: req.user.shop,
  })
    .sort({ date: -1 })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.get("/spending", isAuth, (req, res) => {
  const { start, end } = getTodayRange();

  Move.find({
    type: "sortie",
    subType: "dépense",
    date: { $gte: start, $lte: end },
    shop: req.user.shop,
  })
    .sort({ date: -1 })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.post("/", isAuth, async (req, res) => {
  if (!req.body) {
    res.status(400).send("missing data");
  }

  const { type, amount, account, description, subType, rate } = req.body;

  const move = new Move({
    type,
    subType,
    amount,
    account,
    description,
    rate,
    user: req.user.name,
    date: new Date(),
    shop: req.user.shop,
  });

  let session = null;
  return mongoose.connection.startSession().then(async (_session) => {
    session = _session;
    session.startTransaction();
    try {
      const opts = { session };
      const doc = await move.save(opts);
      await updateAccount(move, true, req.user.shop, opts);
      await session.commitTransaction();
      res.send(doc);
    } catch (error) {
      await session.abortTransaction();
      res.status(400).send(error);
    } finally {
      session.endSession();
    }
  });
});

router.get("/:period", isAuth, (req, res) => {
  const today = new Date();

  const period = req.params.period;
  let query = "";

  if (period === "daily") {
    const { start, end } = getTodayRange();
    query = { $gte: start, $lte: end };
  }
  if (period === "yesterday") {
    const { start, end } = getYesterdayRange();
    query = { $gte: start, $lt: end };
  }
  if (period === "weekly") {
    const { start, end } = getWeekRange();
    query = { $gte: start, $lt: end };
  }
  if (period === "monthly") {
    const { start, end } = getMonthRange();
    query = { $gte: start, $lt: end };
  }

  Move.find({ date: query, shop: req.user.shop })
    .sort({ date: -1 })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.delete("/:id", isAuth, async (req, res) => {
  let session = null;
  return mongoose.connection.startSession().then(async (_session) => {
    session = _session;
    session.startTransaction();
    try {
      const opts = { session };
      const move = await Move.findById(req.params.id).session(opts.session);
      await updateAccount(move, false, req.user.shop, opts);
      const doc = await Move.findByIdAndRemove(req.params.id, opts);
      await session.commitTransaction();
      res.status(200).send(doc);
    } catch (error) {
      await session.abortTransaction();
      res.status(400).send(error);
    } finally {
      session.endSession();
    }
  });
});

router.put("/:id", isAuth, isAdmin, (req, res) => {
  Move.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((doc) => res.status(200).send(doc))
    .catch((err) => res.status(400).send(err));
});

router.delete("/", isAuth, isAdmin, (req, res) => {
  Move.remove({})
    .then(() => res.status(200).send("moves removed"))
    .catch((err) => res.status(400).send(err));
});

const updateAccount = async (move, isMoveAdded = true, shop, opts) => {
  const { subType, amount, account } = move;
  try {
    const accounts = await Account.find({ shop }).session(opts.session).exec();

    if (subType === "gain") {
      if (isMoveAdded) {
        const gainAccount = accounts.find((acc) => acc.name === account);
        await Account.findByIdAndUpdate(gainAccount._id, {
          lastMove: { type: "entrée", amount: amount },
          deposit: Number(gainAccount.deposit) + Number(amount),
        });

        const caisseAccount = accounts.find((acc) => acc.name === "Fond");
        await Account.findByIdAndUpdate(caisseAccount._id, {
          lastMove: { type: "sortie", amount: amount },
          deposit: Number(caisseAccount.deposit) - Number(amount),
        });
      } else {
        const gainAccount = accounts.find((acc) => acc.name === account);
        await Account.findByIdAndUpdate(gainAccount._id, {
          lastMove: { type: "sortie", amount: amount },
          deposit: Number(gainAccount.deposit) - Number(amount),
        });

        const caisseAccount = accounts.find((acc) => acc.name === "Fond");
        await Account.findByIdAndUpdate(caisseAccount._id, {
          lastMove: { type: "entrée", amount: amount },
          deposit: Number(caisseAccount.deposit) + Number(amount),
        });
      }
    }
    if (subType === "dépense") {
      const caisseAccount = accounts.find((acc) => acc.name === "Fond");
      if (isMoveAdded) {
        await Account.findByIdAndUpdate(caisseAccount._id, {
          lastMove: { type: "sortie", amount: amount },
          deposit: Number(caisseAccount.deposit) - Number(amount),
        });
      } else {
        await Account.findByIdAndUpdate(caisseAccount._id, {
          lastMove: { type: "entrée", amount: amount },
          deposit: Number(caisseAccount.deposit) + Number(amount),
        });
      }
    }
    if (subType === "vente") {
      const caisseAccount = accounts.find((acc) => acc.name === "Fond");
      const saleAccount = accounts.find((acc) => acc.name === account);
      const rate = saleAccount.rate;

      if (isMoveAdded) {
        await Account.findByIdAndUpdate(caisseAccount._id, {
          lastMove: { type: "entrée", amount: Number(amount) },
          deposit: Number(caisseAccount.deposit) + Number(amount),
        });
        await Account.findByIdAndUpdate(saleAccount._id, {
          lastMove: {
            type: "sortie",
            amount: (Number(amount) / Number(rate)).toFixed(0),
          },
          deposit:
            Number(saleAccount.deposit) -
            Number((Number(amount) / Number(rate)).toFixed(0)),
        });
      } else {
        await Account.findByIdAndUpdate(caisseAccount._id, {
          lastMove: { type: "sortie", amount: Number(amount) },
          deposit: Number(caisseAccount.deposit) - Number(amount),
        });
        await Account.findByIdAndUpdate(saleAccount._id, {
          lastMove: {
            type: "entrée",
            amount: (Number(amount) / Number(rate)).toFixed(0),
          },
          deposit:
            Number(saleAccount.deposit) +
            Number((Number(amount) / Number(rate)).toFixed(0)),
        });
      }
    }
    if (subType === "versement") {
      const depositAccount = accounts.find((acc) => acc.name === account);
      if (isMoveAdded) {
        await Account.findByIdAndUpdate(depositAccount._id, {
          lastMove: { type: "entrée", amount: Number(amount) },
          deposit: Number(depositAccount.deposit) + Number(amount),
        });
      } else {
        await Account.findByIdAndUpdate(depositAccount._id, {
          lastMove: { type: "sortie", amount: Number(amount) },
          deposit: Number(depositAccount.deposit) - Number(amount),
        });
      }
    }
    if (subType === "retrait") {
      const depositAccount = accounts.find((acc) => acc.name === "Fond");
      if (isMoveAdded) {
        await Account.findByIdAndUpdate(depositAccount._id, {
          lastMove: { type: "sortie", amount: Number(amount) },
          deposit: Number(depositAccount.deposit) - Number(amount),
        });
      } else {
        await Account.findByIdAndUpdate(depositAccount._id, {
          lastMove: { type: "entrée", amount: Number(amount) },
          deposit: Number(depositAccount.deposit) + Number(amount),
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = router;
