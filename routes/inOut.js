const router = require("express").Router();
const InOut = require("../models/InOut");

router.post("/", async (req, res) => {
  if (!req.body) {
    res.status(400).send("missing data");
  }

  const inOut = new InOut({
    depositStart: req.body.deposit,
    depositEnd: req.body.deposit,
    sites: req.body.sites,
    totalWins: req.body.totalWins,
    totalDepenses: req.body.totalDepenses,
  });
  try {
    const addedInOut = await inOut.save();
    res.send(addedInOut);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", (req, res) => {
  InOut.find()
    .then((inOut) => res.status(200).send(inOut))
    .catch((err) => res.status(400).send(err));
});

module.exports = router;
