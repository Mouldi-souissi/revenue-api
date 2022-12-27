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
      $gte: startOfDay(today),
      $lte: endOfDay(today),
    },
  })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.get("/totalWins", isAuth, (req, res) => {
  Move.find({
    type: "sortie",
    subType: "gain",
    date: {
      $gte: startOfDay(today),
      $lte: endOfDay(today),
    },
  })
    .then((docs) => {
      const totalWins = docs.reduce(
        (acc, curr) => (acc += Number(curr.amount)),
        0
      );

      res.json(totalWins);
    })
    .catch((err) => res.status(400).send(err));
});

router.get("/sales", isAuth, (req, res) => {
  Move.find({
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
    date: new Date(),
  });

  try {
    const doc = await move.save();
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

router.delete("/", isAuth, isAdmin, (req, res) => {
  Move.remove({})
    .then(() => res.status(200).send("moves removed"))
    .catch((err) => res.status(400).send(err));
});

module.exports = router;
