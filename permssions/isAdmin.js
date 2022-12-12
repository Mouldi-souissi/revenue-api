const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    if (req.user.type !== "admin") {
      return res.status(401).send("admin permission required !");
    }
  } catch (err) {
    res.status(400).send("invalid token");
  }
  next();
};
