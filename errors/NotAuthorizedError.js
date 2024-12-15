const AppError = require("./AppError");

class NotAuthorizedError extends AppError {
  constructor(message = "Authentication error") {
    super(message, 403);
  }
}

module.exports = NotAuthorizedError;
