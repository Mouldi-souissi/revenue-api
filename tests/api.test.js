const request = require("supertest");
const User = require("../models/User");
const Move = require("../models/Move");
const Account = require("../models/Account");
const History = require("../models/History");

const app = require("../app");
const { connect, disconnect, dropDB, initDB } = require("./init");
const { MOVE_SUBTYPES, MOVE_TYPES, PERIOD_VALUES } = require("../constants");

let dbData = null;

let createdUserId = "";

beforeAll(async () => {
  await connect();
  dbData = await initDB();
  // console.log(dbData);
});

afterAll(async () => {
  await dropDB();
  await disconnect();
});

let userPayload = {
  name: "john",
  email: "john@example.com",
  password: "123456",
  type: "admin",
};

describe("users", () => {
  describe("post /register", () => {
    it("should return registered user", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send(userPayload)
        .set("Authorization", `Bearer ${dbData.adminToken}`);

      const { password, ...responseData } = response.body;

      createdUserId = responseData._id;

      expect(response.body).toMatchObject(responseData);

      const user = await User.findById(responseData._id);

      expect(user.name).toBe(userPayload.name);
    });
    it("should fail (email aready exists)", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send(userPayload)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(400);
    });

    it("should fail invalid payload", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send({})
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(400);
    });
  });

  describe("post /login", () => {
    it("should return jwt token", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({ email: userPayload.email, password: userPayload.password });

      expect(response.status).toBe(200);

      const token = response.header.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should fail Invalid email", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: "invalidemail@mail.com",
          password: userPayload.password,
        })
        .expect(400);
    });

    it("should fail Invalid password", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({ email: userPayload.email, password: "invalid password" })
        .expect(400);
    });
  });

  describe("get /", () => {
    it("should return users", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${dbData.adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
    });
  });

  describe("put /", () => {
    it("should return edited user", async () => {
      const payload = {
        name: "James",
        type: "admin",
      };

      const response = await request(app)
        .put(`/api/users/${createdUserId}`)
        .send(payload)
        .set("Authorization", `Bearer ${dbData.adminToken}`);

      expect(response.status).toBe(200);
      // expect(response.body).toMatchObject(payload);

      const updatedUser = await User.findById(createdUserId);

      expect(updatedUser).toMatchObject(payload);
    });
  });

  describe("delete /", () => {
    it("should delete user", async () => {
      const response = await request(app)
        .delete(`/api/users/${createdUserId}`)
        .set("Authorization", `Bearer ${dbData.adminToken}`);

      expect(response.status).toBe(200);

      const deletedUser = await User.findById(createdUserId);
      expect(deletedUser).toBeNull();
    });
  });
});
describe("moves", () => {
  const sale = { amount: 240 };
  const spending = { amount: 100 };

  describe("post /moves", () => {
    it("should add sale and update accounts and save history", async () => {
      const response = await request(app)
        .post("/api/moves")
        .send({
          type: MOVE_TYPES.in,
          subType: MOVE_SUBTYPES.sale,
          amount: sale.amount,
          account: dbData?.secondaryAccount.name,
          accountId: dbData?.secondaryAccount._id,
          description: "",
        })
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(201);

      expect(sale.amount).toBe(response.body.amount);

      const addedMove = await Move.findById(response.body._id);

      expect(sale.amount).toBe(addedMove.amount);

      const accountMove = await Account.findById(response.body.accountId);

      expect(accountMove.deposit).toBe(800);

      const accountPrimary = await Account.findById(dbData.primaryAccount._id);

      expect(accountPrimary.deposit).toBe(dbData.primaryAccount.deposit + 240);

      const history = await History.find({
        type: MOVE_TYPES.in,
        subType: MOVE_SUBTYPES.sale,
        amount: sale.amount,
      });

      expect(history[0].amount).toBe(sale.amount);
    });

    it("should add spending and update accounts and save history", async () => {
      const response = await request(app)
        .post("/api/moves")
        .send({
          type: MOVE_TYPES.out,
          subType: MOVE_SUBTYPES.spending,
          amount: spending.amount,
          account: dbData?.primaryAccount.name,
          accountId: dbData?.primaryAccount._id,
          description: "",
        })
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(201);

      expect(spending.amount).toBe(response.body.amount);

      const addedMove = await Move.findById(response.body._id);

      expect(spending.amount).toBe(addedMove.amount);

      const accountPrimary = await Account.findById(dbData.primaryAccount._id);

      expect(accountPrimary.deposit).toBe(
        dbData.primaryAccount.deposit + sale.amount - spending.amount,
      );

      const history = await History.find({
        type: MOVE_TYPES.out,
        subType: MOVE_SUBTYPES.spending,
        amount: spending.amount,
      });

      expect(history[0].amount).toBe(spending.amount);
    });
  });
});
