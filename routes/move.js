const router = require("express").Router();
const Move = require("../models/Move");
const Account = require("../models/Account");
const endOfDay = require("date-fns/endOfDay");
const startOfDay = require("date-fns/startOfDay");
const isAuth = require("../permssions/isAuth");

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
      const rate = accounts.find((acc) => acc.name === account).rate;
      if (isMoveAdded) {
        await Account.findByIdAndUpdate(caisseAccount._id, {
          lastMove: { type: "entrée", amount: Number(amount) * Number(rate) },
          deposit:
            Number(caisseAccount.deposit) + Number(amount) * Number(rate),
        });
      } else {
        await Account.findByIdAndUpdate(caisseAccount._id, {
          lastMove: { type: "sortie", amount: Number(amount) * Number(rate) },
          deposit:
            Number(caisseAccount.deposit) - Number(amount) * Number(rate),
        });
      }
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

router.get("/", (req, res) => {
  Move.find()
    .then((doc) => res.status(200).send(doc))
    .catch((err) => res.status(400).send(err));
});

router.get("/spending", (req, res) => {
  Move.find({
    type: "sortie",
    subType: "dépense",
    date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
  })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});
router.get("/win", (req, res) => {
  Move.find({
    type: "sortie",
    subType: "gain",
    date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
  })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.get("/sales", (req, res) => {
  Move.find({
    type: "entrée",
    subType: "vente",
    date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
  })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.delete("/:id", async (req, res) => {
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

router.put("/:id", (req, res) => {
  Move.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((doc) => res.status(200).send(doc))
    .catch((err) => res.status(400).send(err));
});

module.exports = router;