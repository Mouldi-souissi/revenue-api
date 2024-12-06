const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    if (req.user.type !== "admin") {
      return res.status(401).send("admin permission required !");
    }
    next();
  } catch (err) {
    return res.status(401).send("invalid token");
  }
};
