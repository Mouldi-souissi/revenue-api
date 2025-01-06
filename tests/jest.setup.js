const { connect, disconnect, dropDB } = require("./init");

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  // await dropDB();
  await disconnect();
});
