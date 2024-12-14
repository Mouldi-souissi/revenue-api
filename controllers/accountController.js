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
    next(new InternalServerError("An unexpected error occurred"));
  }
});

router.get("/", isAuth, async (req, res, next) => {
  try {
    const accounts = await accountService.getAccounts(req.user.shopId);
    res.status(200).send(accounts);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

router.put("/:id", isAuth, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id) {
      return next(new BadRequestError("Invalid Id"));
    }

    const updatedAccount = await accountService.updateAccount(
      req.params.id,
      req.body,
    );

    res.status(200).send(updatedAccount);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

router.delete("/:id", isAuth, isAdmin, async (req, res, next) => {
  try {
    const deletedAccount = await accountService.deleteAccount(req.params.id);
    res.status(200).send(deletedAccount);
  } catch (err) {
    next(new InternalServerError("An unexpected error occurred"));
  }
});

module.exports = router;
