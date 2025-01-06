const app = require("./app");
const database = require("./db/database");
require("dotenv").config();

// connect to DB
database.connect(process.env.DB);

const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("server is up and running on port " + PORT);
  }
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await database.disconnect();
  process.exit(0);
});
