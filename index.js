const express = require("express");
const app = express();
const cors = require("cors");
const connect = require("./db/connect");

// import routes
// const event = require("./routes/event");
// const product = require("./routes/product");
const user = require("./routes/user");
const site = require("./routes/site");

// connect to DB
connect();

// middlewares
app.use(express.json());
app.use(cors());

// routes
// app.use("/api/event", event);
// app.use("/api/product", product);
app.use("/api/user", user);
app.use("/api/site", site);

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("server is up and running on port " + PORT);
  }
});
