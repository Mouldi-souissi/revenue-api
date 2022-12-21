const router = require("express").Router();
const Account = require("../models/Account");
const isAuth = require("../permssions/isAuth");
const isAdmin = require("../permssions/isAdmin");

router.post("/", isAuth, isAdmin, async (req, res) => {
  if (!req.body) {
    res.status(400).send("missing data");
  }

  const account = new Account({
    name: req.body.name,
    rate: req.body.rate,
    img: req.body.img,
    deposit: req.body.deposit,
    lastMove: { type: "in", amount: req.body.deposit },
  });

  try {
    const doc = await account.save();
    res.send(doc);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", isAuth, (req, res) => {
  Account.find()
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.put("/:id", isAuth, (req, res) => {
  Account.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((doc) => res.json(doc))
    .catch((err) => res.send(err));
});

router.delete("/:id", isAuth, isAdmin, (req, res) => {
  Account.findByIdAndDelete(req.params.id)
    .then((doc) => res.send(doc))
    .catch((err) => res.send(err));
});

module.exports = router;
