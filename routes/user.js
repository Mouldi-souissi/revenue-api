const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAuth = require("../permssions/isAuth");
const isAdmin = require("../permssions/isAdmin");
require("dotenv").config();

router.post("/register", isAuth, isAdmin, async (req, res) => {
  try {
    const { name, email, type, password } = req.body;

    if (!name || !email || !type || !password) {
      return res.status(400).send("invalid payload");
    }

    // check if user already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).send("email already exists");

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      type,
      shop: req.user.shop,
      shopId: req.user.shopId,
    });
    const addedUser = await user.save();
    res.send(addedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("invalid payload");
    }
    // check existance
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("invalid credentials");
    }
    // check if psw is corect
    const validpsw = await bcrypt.compare(password, user.password);
    if (!validpsw) {
      return res.status(400).send("invalid credentials");
    }

    // create token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        type: user.type,
        shop: user.shop,
        shopId: user.shopId,
      },
      process.env.JWTsecret,
    );

    res.header("token", token).send(token);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", isAuth, async (req, res) => {
  try {
    let tempQuery = { shop: req.user.shop };

    if (req.user.shopId) {
      tempQuery = { shopId: req.user.shopId };
    }

    const users = await User.find(tempQuery)
      .select({ password: 0 })
      .sort({ _id: -1 });

    res.status(200).send(users);
  } catch (err) {
    res.status(400).send(err);
  }
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

router.get("/sync", isAuth, async (req, res) => {
  try {
    const aouinaId = "654ff17b2910fb570bface2c";
    const ainId = "654ff150a3d963abb8aa17df";

    const users = await User.find().select({ password: 0 }).sort({ _id: -1 });

    for (let user of users) {
      if (user.shop === "aouina") {
        await User.findByIdAndUpdate(user._id, { shopId: aouinaId });
      }

      if (user.shop === "hamma shop") {
        await User.findByIdAndUpdate(user._id, { shopId: ainId });
      }
    }

    res.status(200).send("sync done");
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
