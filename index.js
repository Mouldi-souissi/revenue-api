const express = require("express");
const app = express();
const cors = require("cors");
const connectToMongoDB = require("./db/connectToMongoDB");

// import routes
const user = require("./routes/user");
const account = require("./routes/account");
const move = require("./routes/move");
const shop = require("./routes/shop");
const history = require("./routes/history");
const backup = require("./routes/backup");

// connect to DB
connectToMongoDB();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/users", user);
app.use("/api/accounts", account);
app.use("/api/moves", move);
app.use("/api/shops", shop);
app.use("/api/history", history);
app.use("/api/backup", backup);

app.use((err, req, res, next) => {
  console.error("Global error handler:", err.message);
  return res
    .status(500)
    .json({ message: "Something went wrong, please try again later" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("server is up and running on port " + PORT);
  }
});
