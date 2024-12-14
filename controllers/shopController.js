const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const shopService = require("../services/shopService");

router.post("/", isAuth, isAdmin, async (req, res) => {
  try {
    const shop = await shopService.createShop(req.body);
    res.status(201).send(shop);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/", isAuth, async (req, res) => {
  try {
    const shops = await shopService.getAllShops();
    res.status(200).send(shops);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/:id", isAuth, async (req, res) => {
  try {
    const shop = await shopService.getShopById(req.params.id);
    res.status(200).send(shop);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.put("/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const updatedShop = await shopService.updateShop(req.params.id, req.body);
    res.status(200).send(updatedShop);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.delete("/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const deletedShop = await shopService.deleteShop(req.params.id);
    res.status(200).send(deletedShop);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
