const AppError = require("../errors/AppError");

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    if (err.statusCode === 500) {
      console.log(`[Internal Server Error]: ${err.message}`);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(err.statusCode).json({ error: err.message });
    }
  } else {
    console.log(`[Internal Server Error]: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = errorHandler;
