const router = require("express").Router();
const InOut = require("../models/InOut");
const endOfDay = require("date-fns/endOfDay");
const startOfDay = require("date-fns/startOfDay");
const isAuth = require("../permssions/isAuth");

router.post("/", isAuth, async (req, res) => {
  if (!req.body) {
    res.status(400).send("missing data");
  }

  const { type, amount, account, description, subType } = req.body;

  const inOut = new InOut({
    type,
    subType,
    amount,
    account,
    description,
    user: req.user.name,
  });
  try {
    const doc = await inOut.save();
    res.send(doc);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", (req, res) => {
  InOut.find()
    .then((doc) => res.status(200).send(doc))
    .catch((err) => res.status(400).send(err));
});

router.get("/out", (req, res) => {
  InOut.find({
    type: "sortie",
    date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
  })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.delete("/:id", (req, res) => {
  InOut.findByIdAndRemove(req.params.id)
    .then((doc) => res.status(200).send(doc))
    .catch((err) => res.status(400).send(err));
});

router.put("/:id", (req, res) => {
  InOut.findByIdAndUpdate(req.params.id)
    .then((doc) => res.status(200).send(doc))
    .catch((err) => res.status(400).send(err));
});

module.exports = router;
