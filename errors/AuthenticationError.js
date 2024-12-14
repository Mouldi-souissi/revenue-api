const AppError = require("./AppError");

class AuthenticationError extends AppError {
  constructor(message = "Authentication error") {
    super(message, 401);
  }
}

module.exports = AuthenticationError;
