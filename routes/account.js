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
    const savedAccount = await account.save();
    res.send(savedAccount);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", (req, res) => {
  Account.find()
    .then((accounts) => res.status(200).send(accounts))
    .catch((err) => res.status(400).send(err));
});

router.put("/:id", (req, res) => {
  const accountId = req.params.id;
  Account.findByIdAndUpdate(accountId, req.body, { new: true })
    .then((editedAccount) => res.json(editedAccount))
    .catch((err) => res.send(err));
});

module.exports = router;
