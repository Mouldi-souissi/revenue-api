const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const validate = require("../middlewares/validate");
const userService = require("../services/userService");

const InternalServerError = require("../errors/InternalServerError");
const BadRequestError = require("../errors/BadRequestError");

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user (admin only)
 *     tags: [Users]
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
 *               email: { type: string }
 *               password: { type: string }
 *               type: { type: string, enum: [admin, utilisateur] }
 *             required: [name, email, password, type]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid payload or email already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin required
 */
router.post(
  "/register",
  isAuth,
  isAdmin,
  validate({
    body: { required: ["name", "email", "password", "type"] },
  }),
  async (req, res, next) => {
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
    if (err instanceof BadRequestError) {
      next(new BadRequestError(err.message));
    }
    next(new InternalServerError(err.message));
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user and get JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *             required: [email, password]
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Invalid email or password
 */
router.post(
  "/login",
  validate({ body: { required: ["email", "password"] } }),
  async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new BadRequestError("Invalid payload"));
    }
    const token = await userService.login(req.body);
    res.header("token", token).send(token);
  } catch (err) {
    if (err instanceof BadRequestError) {
      next(new BadRequestError(err.message));
    }
    next(new InternalServerError(err.message));
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users in shop
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get("/", isAuth, async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.user.shopId);
    res.status(200).send(users);
  } catch (err) {
    next(new InternalServerError(err.message));
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin required
 */
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

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               type: { type: string, enum: [admin, utilisateur] }
 *             required: [name, type]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin required
 */
router.delete(
  "/:id",
  isAuth,
  isAdmin,
  validate({ params: { required: ["id"] } }),
  async (req, res, next) => {
    try {
      const id = req.params.id;

      const deletedUser = await userService.deleteUser(id);
      res.status(200).send(deletedUser);
    } catch (err) {
      next(new InternalServerError(err.message));
    }
  },
);

router.put(
  "/:id",
  isAuth,
  isAdmin,
  validate({ params: { required: ["id"] }, body: { required: ["name", "type"] } }),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const { name, type } = req.body;

      const updatedUser = await userService.updateUser(id, { name, type });
      res.status(200).send(updatedUser);
    } catch (err) {
      next(new InternalServerError(err.message));
    }
  },
);

module.exports = router;
