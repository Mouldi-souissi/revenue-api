const express = require("express");
const app = express();
const cors = require("cors");
const connect = require("./db/connect");

// import routes
const user = require("./routes/user");
const account = require("./routes/account");
const move = require("./routes/move");

// connect to DB
connect();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/user", user);
app.use("/api/account", account);
app.use("/api/move", move);

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("server is up and running on port " + PORT);
  }
});
