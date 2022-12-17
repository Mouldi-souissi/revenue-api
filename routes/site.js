const router = require("express").Router();
const Site = require("../models/Site");

router.post("/", async (req, res) => {
  if (!req.body) {
    res.status(400).send("missing data");
  }

  const site = new Site({
    name: req.body.name,
    rate: req.body.rate,
    img: req.body.img,
  });
  try {
    const doc = await site.save();
    res.send(doc);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", (req, res) => {
  Site.find()
    .then((docs) => res.status(200).send(docs))
    .catch((err) => res.status(400).send(err));
});

router.put("/:id", (req, res) => {
  Site.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((doc) => res.json(doc))
    .catch((err) => res.send(err));
});

router.delete("/:id", (req, res) => {
  Post.findByIdAndDelete(req.params.id)
    .then((doc) => res.send(doc))
    .catch((err) => res.send(err));
});

module.exports = router;
