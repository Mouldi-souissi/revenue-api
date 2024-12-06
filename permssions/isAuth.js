const jwt = require("jsonwebtoken");
const tokenVersion = require("../tokenVersion");
require("dotenv").config();

module.exports = function (req, res, next) {
  try {
    const token = req.header("token");
    if (!token) {
      return res.status(401).json({ message: "Authentication token required" });
    }

    const verified = jwt.verify(token, process.env.JWTsecret);

    if (
      !verified.hasOwnProperty("tokenVersion") ||
      verified.tokenVersion != tokenVersion
    ) {
      return res
        .status(401)
        .json({ message: "Token version mismatch, please re-login" });
    }

    req.user = verified;
    next();
  } catch (err) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired, please re-login" });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Invalid token, please re-login" });
    }
    console.error("Unexpected error during authentication:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
