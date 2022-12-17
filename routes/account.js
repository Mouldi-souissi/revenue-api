const router = require("express").Router();
const Account = require("../models/Account");

router.post("/", async (req, res) => {
  if (!req.body) {
    res.status(400).send("missing data");
  }

  const account = new Account({
    name: req.body.name,
    deposit: req.body.deposit,
    previousDeposit: req.body.previousDeposit,
  });

  try {
    const doc = await account.save();
    res.send(doc);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", (req, res) => {
  Account.find()
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.put("/:id", (req, res) => {
  Account.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((doc) => res.json(doc))
    .catch((err) => res.send(err));
});

router.delete("/:id", (req, res) => {
  Account.findByIdAndDelete(req.params.id, req.body, { new: true })
    .then((doc) => res.json(doc))
    .catch((err) => res.send(err));
});

module.exports = router;
