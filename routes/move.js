const router = require("express").Router();
const Move = require("../models/Move");
const endOfDay = require("date-fns/endOfDay");
const startOfDay = require("date-fns/startOfDay");
const isAuth = require("../permssions/isAuth");

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

router.delete("/:id", (req, res) => {
  Move.findByIdAndRemove(req.params.id)
    .then((doc) => res.status(200).send(doc))
    .catch((err) => res.status(400).send(err));
});

router.put("/:id", (req, res) => {
  Move.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((doc) => res.status(200).send(doc))
    .catch((err) => res.status(400).send(err));
});

module.exports = router;
