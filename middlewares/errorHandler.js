const AppError = require("../errors/AppError");

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    console.error(`[Internal Server Error]: ${err.stack}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = errorHandler;
