const router = require("express").Router();
const Move = require("../models/Move");
const Account = require("../models/Account");
const endOfDay = require("date-fns/endOfDay");
const startOfDay = require("date-fns/startOfDay");
const startOfWeek = require("date-fns/startOfWeek");
const endOfWeek = require("date-fns/endOfWeek");
const startOfMonth = require("date-fns/startOfMonth");
const endOfMonth = require("date-fns/endOfMonth");
const isAuth = require("../permssions/isAuth");
const isAdmin = require("../permssions/isAdmin");

const today = new Date();

router.get("/wins", isAuth, (req, res) => {
  Move.find({
    type: "sortie",
    subType: "gain",
    date: {
      $gte: yesterday,
      $lte: today,
    },
  })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.get("/sales", isAuth, (req, res) => {
  Move.find()
    .where({
      type: "entrée",
      subType: "vente",
      date: {
        $gte: startOfDay(today),
        $lte: endOfDay(today),
      },
    })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.get("/spending", isAuth, (req, res) => {
  Move.find({
    type: "sortie",
    subType: "dépense",
    date: { $gte: startOfDay(today), $lte: endOfDay(today) },
  })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

const updateAccount = async (move, isMoveAdded = true) => {
  const { subType, amount, account } = move;
  try {
    const accounts = await Account.find().then((docs) => {
      return docs;
    });

    if (subType === "gain") {
      if (isMoveAdded) {
        const gainAccount = accounts.find((acc) => acc.name === account);
        await Account.findByIdAndUpdate(gainAccount._id, {
          lastMove: { type: "entrée", amount: amount },
          deposit: Number(gainAccount.deposit) + Number(amount),
        });

        const caisseAccount = accounts.find((acc) => acc.name === "Caisse");
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

        const caisseAccount = accounts.find((acc) => acc.name === "Caisse");
        await Account.findByIdAndUpdate(caisseAccount._id, {
          lastMove: { type: "entrée", amount: amount },
          deposit: Number(caisseAccount.deposit) + Number(amount),
        });
      }
    }
    if (subType === "dépense") {
      const caisseAccount = accounts.find((acc) => acc.name === "Caisse");
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
      const caisseAccount = accounts.find((acc) => acc.name === "Caisse");
      const saleAccount = accounts.find((acc) => acc.name === account);
      const rate = accounts.find((acc) => acc.name === account).rate;
      if (isMoveAdded) {
        await Account.findByIdAndUpdate(caisseAccount._id, {
          lastMove: { type: "entrée", amount: Number(amount) * Number(rate) },
          deposit:
            Number(caisseAccount.deposit) + Number(amount) * Number(rate),
        });
        await Account.findByIdAndUpdate(saleAccount._id, {
          lastMove: { type: "sortie", amount: Number(amount) },
          deposit: Number(saleAccount.deposit) - Number(amount),
        });
      } else {
        await Account.findByIdAndUpdate(caisseAccount._id, {
          lastMove: { type: "sortie", amount: Number(amount) * Number(rate) },
          deposit:
            Number(caisseAccount.deposit) - Number(amount) * Number(rate),
        });
        await Account.findByIdAndUpdate(saleAccount._id, {
          lastMove: { type: "entrée", amount: Number(amount) },
          deposit: Number(saleAccount.deposit) + Number(amount),
        });
      }
    }
    if (subType === "versement") {
      const depositAccount = accounts.find((acc) => acc.name === account);
      await Account.findByIdAndUpdate(depositAccount._id, {
        lastMove: { type: "entrée", amount: Number(amount) },
        deposit: Number(depositAccount.deposit) + Number(amount),
      });
    }
  } catch (error) {
    console.log(error);
  }
};

router.post("/", isAuth, async (req, res) => {
  if (!req.body) {
    res.status(400).send("missing data");
  }

  const { type, amount, account, description, subType } = req.body;

  const move = new Move({
    type,
    subType,
    amount,
    account,
    description,
    user: req.user.name,
  });

  try {
    const doc = await move.save();
    await updateAccount(move);
    res.send(doc);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:period", isAuth, isAdmin, (req, res) => {
  const period = req.params.period;
  let query = "";

  if (period === "daily") {
    query = { $gte: startOfDay(today), $lte: endOfDay(today) };
  }
  if (period === "weekly") {
    query = {
      $gte: startOfWeek(today, { weekStartsOn: 1 }),
      $lte: endOfWeek(today, { weekStartsOn: 1 }),
    };
  }
  if (period === "monthly") {
    query = { $gte: startOfMonth(today), $lte: endOfMonth(today) };
  }
  Move.find({ date: query })
    .sort({ date: -1 })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.delete("/:id", isAuth, async (req, res) => {
  try {
    const move = await Move.findById(req.params.id);
    await updateAccount(move, false);
    Move.findByIdAndRemove(req.params.id)
      .then((doc) => res.status(200).send(doc))
      .catch((err) => res.status(400).send(err));
  } catch (error) {
    console.log(error);
  }
});

router.put("/:id", isAuth, isAdmin, (req, res) => {
  Move.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((doc) => res.status(200).send(doc))
    .catch((err) => res.status(400).send(err));
});

module.exports = router;
