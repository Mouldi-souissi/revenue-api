const Move = require("../models/Move");
const Account = require("../models/Account");
const History = require("../models/History");
const request = require("supertest");
const { getMockToken } = require("./helpers");
const { MOVE_SUBTYPES, MOVE_TYPES, PERIOD_VALUES } = require("../constants");
const app = require("../app");

const PORT = 0;

const adminToken = getMockToken("admin");

// beforeAll(async () => {
//   await connect();
// });

// afterAll(async () => {
//   await dropDB();
//   await disconnect();
// });

describe("get /moves/:period/:subType", () => {
  it("should return moves (all) (daily)", async () => {
    const response = await request(app)
      .get(`/api/moves/${PERIOD_VALUES.daily}/${MOVE_SUBTYPES.all}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
  });

  it("should return all moves (all) (yesterday)", async () => {
    const response = await request(app)
      .get(`/api/moves/${PERIOD_VALUES.yesterday}/${MOVE_SUBTYPES.all}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
  });

  it("should return all moves (all) (weekly)", async () => {
    const response = await request(app)
      .get(`/api/moves/${PERIOD_VALUES.weekly}/${MOVE_SUBTYPES.all}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
  });

  it("should return all moves (all) (monthly)", async () => {
    const response = await request(app)
      .get(`/api/moves/${PERIOD_VALUES.monthly}/${MOVE_SUBTYPES.all}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
  });
});

// describe("post /moves", () => {
//   it("should add sale and update accounts and save history", async () => {
//     const move = {
//       type: MOVE_TYPES.in,
//       subType: MOVE_SUBTYPES.sale,
//       amount: 200,
//       account: "secondary1",
//       accountId: "secondary1id",
//       description: "",
//     };

//     const response = await request(app)
//       .post("/api/moves")
//       .send(move)
//       .set("Authorization", `Bearer ${adminToken}`)
//       .expect(201);
//   });
// });
