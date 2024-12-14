const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const historyService = require("../services/historyService");

router.get("/:start/:end", isAuth, isAdmin, async (req, res) => {
  try {
    const { start, end } = req.params;

    const history = await historyService.getHistoryByDateRange(
      req.user.shop,
      start,
      end,
    );
    res.status(200).send(history);
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

router.post("/", isAuth, async (req, res) => {
  try {
    const newHistory = await historyService.createHistory(req.body);
    res.status(201).send(newHistory);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
