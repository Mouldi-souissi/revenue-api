const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const userService = require("../services/userService");

const InternalServerError = require("../errors/InternalServerError");
const BadRequestError = require("../errors/BadRequestError");

router.post("/register", isAuth, isAdmin, async (req, res, next) => {
  try {
    const { name, email, password, type } = req.body;

    if (!name || !email || !password || !type) {
      return next(new BadRequestError("Invalid payload"));
    }
    const user = await userService.register(
      { name, email, password, type },
      req.user,
    );
    res.status(201).send(user);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const token = await userService.login(req.body);
    res.header("token", token).send(token);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

router.get("/", isAuth, async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.user.shopId);
    res.status(200).send(users);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

router.delete("/:id", isAuth, isAdmin, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id) {
      return next(new BadRequestError("missing id"));
    }

    const deletedUser = await userService.deleteUser(id);
    res.status(200).send(deletedUser);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

router.put("/:id", isAuth, isAdmin, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id) {
      return next(new BadRequestError("missing id"));
    }

    const { name, type } = req.body;

    if (!name || !type) {
      return next(new BadRequestError("Invalid payload"));
    }
    const updatedUser = await userService.updateUser(id, { name, type });
    res.status(200).send(updatedUser);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

module.exports = router;
