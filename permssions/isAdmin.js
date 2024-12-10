const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    if (!req.user || req.user.type !== "admin") {
      return res.status(403).send("Admin permission required!");
    }
    next(); // User is an admin, proceed to the next middleware or route handler
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).send("Internal server error");
  }
};
