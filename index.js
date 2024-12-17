const express = require("express");
const app = express();
const cors = require("cors");
const connectToMongoDB = require("./db/connectToMongoDB");
const errorHandler = require("./middlewares/errorHandler");

// import routes
const userController = require("./controllers/userController");
const accountController = require("./controllers/accountController");
const moveController = require("./controllers/moveController");
const shopController = require("./controllers/shopController");
const historyController = require("./controllers/historyController");
const backupController = require("./controllers/backupController");

// connect to DB
connectToMongoDB();

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
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("server is up and running on port " + PORT);
  }
});
