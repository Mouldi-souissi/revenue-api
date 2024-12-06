const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const token = req.header("token");
  if (!token) return res.status(401).send("unauthorised !");
  try {
    const verified = jwt.verify(token, process.env.JWTsecret);
    req.user = verified;
  } catch (err) {
    res.status(400).send("invalid token");
  }
  next();
};
