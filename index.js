const express = require("express");
const app = express();
const cors = require("cors");
const connect = require("./db/connect");
const Move = require("./models/Move");

//sockets
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" },
});

const changeStream = Move.watch();

changeStream.on("change", (next) => {
  if (next.operationType === "insert") {
    io.emit("addedMove", next.fullDocument);
  }
  if (next.operationType === "delete") {
    io.emit("deletedMove", next.documentKey);
  }
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
});

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
http.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("server is up and running on port " + PORT);
  }
});
