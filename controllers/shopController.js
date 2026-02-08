const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const validate = require("../middlewares/validate");
const shopService = require("../services/shopService");

const InternalServerError = require("../errors/InternalServerError");

/**
 * @swagger
 * /shops:
 *   post:
 *     summary: Create a new shop (admin only)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               address: { type: string }
 *             required: [name]
 *     responses:
 *       201:
 *         description: Shop created
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin required
 *
 *   get:
 *     summary: Get all shops
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shops
 *
 * /shops/{id}:
 *   get:
 *     summary: Get shop by id
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Shop object
 */

router.post(
  "/",
  isAuth,
  isAdmin,
  validate({ body: { required: ["name"] } }),
  async (req, res, next) => {
    try {
      const shop = await shopService.createShop(req.body);
      res.status(201).send(shop);
    } catch (err) {
      next(new InternalServerError(err.message));
    }
  },
);

router.get("/", isAuth, async (req, res, next) => {
  try {
    const shops = await shopService.getAllShops();
    res.status(200).send(shops);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

router.get("/:id", isAuth, async (req, res, next) => {
  try {
    const shop = await shopService.getShopById(req.params.id);
    res.status(200).send(shop);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

router.get(
  "/:id",
  isAuth,
  validate({ params: { required: ["id"] } }),
  async (req, res, next) => {
    try {
      const shop = await shopService.getShopById(req.params.id);
      res.status(200).send(shop);
    } catch (err) {
      next(new InternalServerError(err.message));
    }
  },
);

router.put(
  "/:id",
  isAuth,
  isAdmin,
  validate({ params: { required: ["id"] }, body: { required: ["name"] } }),
  async (req, res, next) => {
    try {
      const updatedShop = await shopService.updateShop(req.params.id, req.body);
      res.status(200).send(updatedShop);
    } catch (err) {
      next(new InternalServerError(err.message));
    }
  },
);

router.delete(
  "/:id",
  isAuth,
  isAdmin,
  validate({ params: { required: ["id"] } }),
  async (req, res, next) => {
    try {
      const deletedShop = await shopService.deleteShop(req.params.id);
      res.status(200).send(deletedShop);
    } catch (err) {
      next(new InternalServerError(err.message));
    }
  },
);

module.exports = router;
