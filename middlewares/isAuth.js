const jwt = require("jsonwebtoken");
const tokenVersion = require("../tokenVersion");
const AuthenticationError = require("../errors/AuthenticationError");
require("dotenv").config();

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new AuthenticationError("Authentication token required");
  }

  let verified;
  try {
    verified = jwt.verify(token, process.env.JWTsecret);
  } catch (err) {
    throw new AuthenticationError("Authentication token expired");
  }

  if (
    !verified ||
    !verified.hasOwnProperty("tokenVersion") ||
    verified.tokenVersion !== tokenVersion
  ) {
    throw new AuthenticationError("Invalid token");
  }

  req.user = verified;
  next();
};
