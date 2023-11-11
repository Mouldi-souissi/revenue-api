const router = require("express").Router();
const Shop = require("../models/Shop");

router.get("/", (req, res) => {
  Shop.find()
    .sort({ _id: -1 })
    .then((shops) => res.status(200).send(shops))
    .catch((err) => res.status(400).send(err));
});
// router.get("/test", async (req, res) => {
//   try {
//     const shop = new Shop({
//       name: "aouina",
//       adress: "aouina",
//     });
//     await shop.save();
//     res.send("ok");
//   } catch (error) {
//     console.log(error);
//   }
// });

module.exports = router;
