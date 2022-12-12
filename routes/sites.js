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
    const addedSite = await site.save();
    res.send(addedSite);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", (req, res) => {
  Site.find()
    .then((sites) => res.status(200).send(sites))
    .catch((err) => res.status(400).send(err));
});

router.put("/:id", (req, res) => {
  const siteId = req.params.id;
  Site.findByIdAndUpdate(siteId, req.body, { new: true })
    .then((editedSite) => res.json(editedSite))
    .catch((err) => res.send(err));
});

router.delete("/:id", (req, res) => {
  const siteId = req.params.id;
  Post.findByIdAndDelete(siteId)
    .then(res.send("site deleted"))
    .catch((err) => res.send(err));
});

module.exports = router;
