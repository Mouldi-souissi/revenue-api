const tokenVersion = require("../tokenVersion");
const AuthenticationError = require("../errors/AuthenticationError");
const { decodeToken } = require("../helpers/token");

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new AuthenticationError("Authentication token required");
  }

  let verified;
  try {
    verified = decodeToken(token);
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
