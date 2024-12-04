const router = require("express").Router();
const Account = require("../models/Account");
const isAuth = require("../permssions/isAuth");
const isAdmin = require("../permssions/isAdmin");

router.post("/", isAuth, async (req, res) => {
  if (!req.body) {
    res.status(400).send("missing data");
  }

  const account = new Account({
    name: req.body.name,
    deposit: req.body.deposit,
    shop: req.user.shop,
  });

  try {
    const doc = await account.save();
    res.send(doc);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", isAuth, (req, res) => {
  Account.find({ shop: req.user.shop })
    .sort({ _id: -1 })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.get("/:name", isAuth, (req, res) => {
  Account.find({ name: req.params.name, shop: req.user.shop })
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.put("/:id", isAuth, (req, res) => {
  Account.findByIdAndUpdate(
    req.params.id,
    { ...req.body, lastUpdated: new Date() },
    { new: true },
  )
    .then((doc) => res.json(doc))
    .catch((err) => res.send(err));
});

router.delete("/:id", isAuth, isAdmin, (req, res) => {
  Account.findByIdAndDelete(req.params.id)
    .then((doc) => res.send(doc))
    .catch((err) => res.send(err));
});

module.exports = router;
