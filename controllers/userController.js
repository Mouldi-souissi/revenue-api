const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const userService = require("../services/userService");

router.post("/register", isAuth, isAdmin, async (req, res) => {
  try {
    const user = await userService.register(req.body, req.user);
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const token = await userService.login(req.body);
    res.header("token", token).send(token);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/", isAuth, async (req, res) => {
  try {
    const users = await userService.getUsers(req.user.shopId);
    res.status(200).send(users);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.delete("/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const deletedUser = await userService.deleteUser(req.params.id);
    res.status(200).send(deletedUser);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.put("/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(200).send(updatedUser);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
