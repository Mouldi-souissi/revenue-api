const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const historyService = require("../services/historyService");

const InternalServerError = require("../errors/InternalServerError");
const BadRequestError = require("../errors/BadRequestError");

/**
 * @swagger
 * /history/{start}/{end}:
 *   get:
 *     summary: Get history entries in a date range (admin only)
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: start
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: end
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of history entries
 *       400:
 *         description: Invalid date interval
 *
 * /history:
 *   post:
 *     summary: Create a history entry
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/History'
 *     responses:
 *       201:
 *         description: History created
 */

router.get("/:start/:end", isAuth, isAdmin, async (req, res, next) => {
  try {
    const { start, end } = req.params;

    if (!start || !end) {
      return next(new BadRequestError("invalid date interval"));
    }

    const history = await historyService.getHistoryByDateRange(
      req.user.shop,
      start,
      end,
    );
    res.status(200).send(history);
  } catch (error) {
    next(new InternalServerError(err.message));
  }
});

router.post("/", isAuth, async (req, res, next) => {
  try {
    const newHistory = await historyService.createHistory(req.body);
    res.status(201).send(newHistory);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

module.exports = router;
