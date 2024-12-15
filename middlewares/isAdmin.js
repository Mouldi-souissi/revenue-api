const jwt = require("jsonwebtoken");
const NotAuthorizedError = require("../errors/NotAuthorizedError");
const { USER_ROLES } = require("../constants");

module.exports = function (req, res, next) {
  if (!req.user || req.user.type !== USER_ROLES.ADMIN) {
    throw new NotAuthorizedError("Not Authorized");
  }
  next();
};
