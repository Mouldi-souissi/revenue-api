const router = require("express").Router();
const Account = require("../models/Account");
const isAuth = require("../permssions/isAuth");
const isAdmin = require("../permssions/isAdmin");

router.post("/", isAuth, async (req, res) => {
  try {
    const { name, deposit, rate } = req.body;

    if (!name || !deposit || !rate) {
      res.status(400).send("invalid payload");
    }

    const account = new Account({
      name,
      deposit,
      rate,
      shop: req.user.shop,
      shopId: req.user.shopId,
    });

    const doc = await account.save();
    res.send(doc);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", isAuth, async (req, res) => {
  try {
    const accounts = await Account.find({ shopId: req.user.shopId }).sort({
      _id: -1,
    });
    res.status(200).send(accounts);
  } catch (err) {
    res.status(400).send(err);
  }
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

// router.get("/sync", isAuth, async (req, res) => {
//   try {
//     const aouinaId = "654ff17b2910fb570bface2c";
//     const ainId = "654ff150a3d963abb8aa17df";

//     const accounts = await Account.find();

//     for (let account of accounts) {
//       if (account.name === "Fond") {
//         await Account.findByIdAndUpdate(account._id, { type: "primary" });
//       }

//       if (account.shop === "aouina") {
//         await Account.findByIdAndUpdate(account._id, { shopId: aouinaId });
//       }

//       if (account.shop === "hamma shop") {
//         await Account.findByIdAndUpdate(account._id, { shopId: ainId });
//       }
//     }

//     res.status(200).send("sync done");
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

module.exports = router;
