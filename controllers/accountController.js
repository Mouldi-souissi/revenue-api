const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const accountService = require("../services/accountService");
const InternalServerError = require("../errors/InternalServerError");
const BadRequestError = require("../errors/BadRequestError");

router.post("/", isAuth, isAdmin, async (req, res, next) => {
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

router.put("/:id", isAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, rate } = req.body;

    if (!id) {
      return next(new BadRequestError("Invalid Id"));
    }

    if (!name || !rate) {
      return next(new BadRequestError("invalid payload"));
    }

    const update = {
      name,
      rate: Number(rate),
      lastUpdated: new Date(),
    };

    const updatedAccount = await accountService.updateAccount(
      req.params.id,
      update,
    );

    res.status(200).send(updatedAccount);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

router.delete("/:id", isAuth, isAdmin, async (req, res, next) => {
  try {
    const deletedAccount = await accountService.deleteAccount(req.params.id);
    res.status(200).send(deletedAccount);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

module.exports = router;
