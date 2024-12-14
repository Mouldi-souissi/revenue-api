const AppError = require("./AppError");

class BadRequestError extends AppError {
  constructor(message = "BadRequestError") {
    super(message, 400);
  }
}

module.exports = BadRequestError;
