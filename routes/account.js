const router = require("express").Router();
const isAuth = require("../permssions/isAuth");
const isAdmin = require("../permssions/isAdmin");
const accountService = require("../services/accountService");

router.post("/", isAuth, async (req, res) => {
  try {
    const account = await accountService.createAccount(req.body, req.user);
    res.status(201).send(account);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/", isAuth, async (req, res) => {
  try {
    const accounts = await accountService.getAccounts(req.user.shopId);
    res.status(200).send(accounts);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.put("/:id", isAuth, async (req, res) => {
  try {
    const updatedAccount = await accountService.updateAccount(
      req.params.id,
      req.body,
    );
    res.status(200).send(updatedAccount);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.delete("/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const deletedAccount = await accountService.deleteAccount(req.params.id);
    res.status(200).send(deletedAccount);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
