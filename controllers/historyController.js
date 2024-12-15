const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const historyService = require("../services/historyService");

const InternalServerError = require("../errors/InternalServerError");
const BadRequestError = require("../errors/BadRequestError");

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
