const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const database = require("./db/database");

// import routes
const userController = require("./controllers/userController");
const accountController = require("./controllers/accountController");
const moveController = require("./controllers/moveController");
const shopController = require("./controllers/shopController");
const historyController = require("./controllers/historyController");
const backupController = require("./controllers/backupController");

// connect to DB
database.connect();

// middlewares
app.use(express.json());
app.use(cors());

// routes
const apiRoutes = express.Router();
apiRoutes.use("/users", userController);
apiRoutes.use("/accounts", accountController);
apiRoutes.use("/moves", moveController);
apiRoutes.use("/shops", shopController);
apiRoutes.use("/history", historyController);
apiRoutes.use("/backup", backupController);
app.use("/api", apiRoutes);

// errors
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("server is up and running on port " + PORT);
  }
});

module.exports = { app, server };
