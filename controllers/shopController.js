const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const shopService = require("../services/shopService");

const InternalServerError = require("../errors/InternalServerError");

router.post("/", isAuth, isAdmin, async (req, res, next) => {
  try {
    const shop = await shopService.createShop(req.body);
    res.status(201).send(shop);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

router.get("/", isAuth, async (req, res, next) => {
  try {
    const shops = await shopService.getAllShops();
    res.status(200).send(shops);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

router.get("/:id", isAuth, async (req, res, next) => {
  try {
    const shop = await shopService.getShopById(req.params.id);
    res.status(200).send(shop);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

router.put("/:id", isAuth, isAdmin, async (req, res, next) => {
  try {
    const updatedShop = await shopService.updateShop(req.params.id, req.body);
    res.status(200).send(updatedShop);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

router.delete("/:id", isAuth, isAdmin, async (req, res, next) => {
  try {
    const deletedShop = await shopService.deleteShop(req.params.id);
    res.status(200).send(deletedShop);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

module.exports = router;
