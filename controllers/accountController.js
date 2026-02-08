const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const validate = require("../middlewares/validate");
const accountService = require("../services/accountService");
const InternalServerError = require("../errors/InternalServerError");
const BadRequestError = require("../errors/BadRequestError");

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new account (admin only)
 *     tags: [Accounts]
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
 *               deposit: { type: number }
 *               rate: { type: number }
 *             required: [name, deposit, rate]
 *     responses:
 *       201:
 *         description: Account created
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin required
 *
 *   get:
 *     summary: Get all accounts for the shop
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accounts
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/",
  isAuth,
  isAdmin,
  validate({ body: { required: ["name", "deposit", "rate"] } }),
  async (req, res, next) => {
  try {
    const { name, deposit, rate } = req.body;

    if (!name || !deposit || !rate) {
      return next(new BadRequestError("invalid payload"));
    }

    const account = await accountService.createAccount(
      { name, deposit, rate },
      req.user,
    );
    res.status(201).send(account);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

router.get("/", isAuth, async (req, res, next) => {
  try {
    const accounts = await accountService.getAccounts(req.user.shopId);
    res.status(200).send(accounts);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

router.put(
  "/:id",
  isAuth,
  validate({ params: { required: ["id"] }, body: { required: ["name", "rate"] } }),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const { name, rate } = req.body;

      const update = {
        name,
        rate: Number(rate),
        lastUpdated: new Date(),
      };

      const updatedAccount = await accountService.updateAccount(id, update);

      res.status(200).send(updatedAccount);
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
      const deletedAccount = await accountService.deleteAccount(req.params.id);
      res.status(200).send(deletedAccount);
    } catch (err) {
      next(new InternalServerError(err.message));
    }
  },
);

module.exports = router;
