const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAuth = require("../permssions/isAuth");
const isAdmin = require("../permssions/isAdmin");
require("dotenv").config();

// register
// public route
router.post("/register", isAuth, isAdmin, async (req, res) => {
  // hash psw
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  // check if user already exists
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("email already exists");

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    type: req.body.type,
    shop: req.user.shop || "aouina",
  });
  try {
    const addedUser = await user.save();
    res.send(addedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

// login
// public route
router.post("/login", async (req, res) => {
  // check existance
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("invalid credentials");
  }
  // check if psw is corect
  const validpsw = await bcrypt.compare(req.body.password, user.password);
  if (!validpsw) {
    return res.status(400).send("invalid credentials");
  }

  // create token
  const token = jwt.sign(
    { id: user._id, name: user.name, type: user.type, shop: user.shop },
    process.env.JWTsecret,
  );
  res.header("token", token).send(token);
});

router.get("/", isAuth, (req, res) => {
  User.find({ shop: req.user.shop })
    .select({ password: 0 })
    .sort({ _id: -1 })
    .then((users) => res.status(200).send(users))
    .catch((err) => res.status(400).send(err));
});

router.delete("/:id", isAuth, isAdmin, (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((deletedUser) => res.status(200).send(deletedUser))
    .catch((err) => res.status(400).send(err));
});

router.put("/:id", isAuth, (req, res) => {
  User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((doc) => res.json(doc))
    .catch((err) => res.send(err));
});

module.exports = router;
