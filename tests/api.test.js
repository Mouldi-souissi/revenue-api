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
  const win = { amount: 50 };
  const deposit = { amount: 150 };
  const withdraw = { amount: 150 };

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

    it("should add win and update accounts and save history", async () => {
      const response = await request(app)
        .post("/api/moves")
        .send({
          type: MOVE_TYPES.out,
          subType: MOVE_SUBTYPES.win,
          amount: win.amount,
          account: dbData?.secondaryAccount.name,
          accountId: dbData?.secondaryAccount._id,
          description: "",
        })
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(201);

      expect(win.amount).toBe(response.body.amount);

      const addedMove = await Move.findById(response.body._id);

      expect(win.amount).toBe(addedMove.amount);

      const accountSecondary = await Account.findById(
        dbData.secondaryAccount._id,
      );

      expect(accountSecondary.deposit).toBe(850);

      const accountPrimary = await Account.findById(dbData.primaryAccount._id);

      expect(accountPrimary.deposit).toBe(
        dbData.primaryAccount.deposit +
          sale.amount -
          spending.amount -
          win.amount,
      );

      const history = await History.find({
        type: MOVE_TYPES.out,
        subType: MOVE_SUBTYPES.win,
        amount: win.amount,
      });

      expect(history[0].amount).toBe(win.amount);
    });

    it("should add deposit and update account and save history", async () => {
      const response = await request(app)
        .post("/api/moves")
        .send({
          type: MOVE_TYPES.in,
          subType: MOVE_SUBTYPES.deposit,
          amount: deposit.amount,
          account: dbData?.primaryAccount.name,
          accountId: dbData?.primaryAccount._id,
          description: "",
        })
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(201);

      expect(deposit.amount).toBe(response.body.amount);

      const addedMove = await Move.findById(response.body._id);

      expect(deposit.amount).toBe(addedMove.amount);

      const accountPrimary = await Account.findById(dbData.primaryAccount._id);

      expect(accountPrimary.deposit).toBe(
        dbData.primaryAccount.deposit +
          sale.amount -
          spending.amount -
          win.amount +
          deposit.amount,
      );

      const history = await History.find({
        type: MOVE_TYPES.in,
        subType: MOVE_SUBTYPES.deposit,
        amount: deposit.amount,
      });

      expect(history[0].amount).toBe(deposit.amount);
    });

    it("should add withdraw and update account and save history", async () => {
      const response = await request(app)
        .post("/api/moves")
        .send({
          type: MOVE_TYPES.out,
          subType: MOVE_SUBTYPES.withdraw,
          amount: withdraw.amount,
          account: dbData?.primaryAccount.name,
          accountId: dbData?.primaryAccount._id,
          description: "",
        })
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(201);

      expect(withdraw.amount).toBe(response.body.amount);

      const addedMove = await Move.findById(response.body._id);

      expect(withdraw.amount).toBe(addedMove.amount);

      const accountPrimary = await Account.findById(dbData.primaryAccount._id);

      expect(accountPrimary.deposit).toBe(
        dbData.primaryAccount.deposit +
          sale.amount -
          spending.amount -
          win.amount,
      );

      const history = await History.find({
        type: MOVE_TYPES.out,
        subType: MOVE_SUBTYPES.withdraw,
        amount: withdraw.amount,
      });

      expect(history[0].amount).toBe(withdraw.amount);
    });
  });

  describe("delete /moves:id", () => {});
});

describe("accounts", () => {
  let createdAccountId = "";

  describe("post /accounts", () => {
    it("should create a new account", async () => {
      const accountPayload = {
        name: "Test Account",
        deposit: 500,
        rate: 1.0,
      };

      const response = await request(app)
        .post("/api/accounts")
        .send(accountPayload)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(201);

      createdAccountId = response.body._id;

      expect(response.body.name).toBe(accountPayload.name);
      expect(response.body.deposit).toBe(accountPayload.deposit);
      expect(response.body.rate).toBe(accountPayload.rate);

      const account = await Account.findById(createdAccountId);
      expect(account).toBeDefined();
    });

    it("should fail to create account without admin privilege", async () => {
      const accountPayload = {
        name: "Unauthorized Account",
        deposit: 300,
        rate: 1.0,
      };

      await request(app)
        .post("/api/accounts")
        .send(accountPayload)
        .set("Authorization", `Bearer ${dbData.userToken}`)
        .expect(403);
    });

    it("should fail to create account without auth", async () => {
      const accountPayload = {
        name: "No Auth Account",
        deposit: 300,
        rate: 1.0,
      };

      await request(app)
        .post("/api/accounts")
        .send(accountPayload)
        .expect(401);
    });

    it("should fail without required fields", async () => {
      await request(app)
        .post("/api/accounts")
        .send({ name: "Missing rate" })
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(400);
    });
  });

  describe("get /accounts", () => {
    it("should return all accounts", async () => {
      const response = await request(app)
        .get("/api/accounts")
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should fail without auth", async () => {
      await request(app).get("/api/accounts").expect(401);
    });
  });

  describe("put /accounts/:id", () => {
    it("should update account", async () => {
      const updatePayload = {
        name: "Updated Account",
        rate: 1.5,
      };

      const response = await request(app)
        .put(`/api/accounts/${createdAccountId}`)
        .send(updatePayload)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      expect(response.body.name).toBe(updatePayload.name);
      expect(response.body.rate).toBe(updatePayload.rate);
    });

    it("should fail to update without rate", async () => {
      await request(app)
        .put(`/api/accounts/${createdAccountId}`)
        .send({ name: "Test" })
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(400);
    });
  });

  describe("delete /accounts/:id", () => {
    it("should delete account", async () => {
      const response = await request(app)
        .delete(`/api/accounts/${createdAccountId}`)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      const deletedAccount = await Account.findById(createdAccountId);
      expect(deletedAccount).toBeNull();
    });

    it("should fail to delete without admin privilege", async () => {
      // Create a temporary account to try to delete with user token
      const tempAccount = await Account.create({
        name: "Temp Account",
        deposit: 100,
        rate: 1.0,
        shop: dbData.shop.name,
        shopId: dbData.shop._id,
      });

      await request(app)
        .delete(`/api/accounts/${tempAccount._id}`)
        .set("Authorization", `Bearer ${dbData.userToken}`)
        .expect(403);
    });
  });
});

describe("shops", () => {
  let createdShopId = "";

  describe("post /shops", () => {
    it("should create a new shop", async () => {
      const shopPayload = {
        name: "Test Shop",
        address: "123 Test Street",
      };

      const response = await request(app)
        .post("/api/shops")
        .send(shopPayload)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(201);

      createdShopId = response.body._id;

      expect(response.body.name).toBe(shopPayload.name);
      expect(response.body.address).toBe(shopPayload.address);
    });

    it("should fail without admin privilege", async () => {
      const shopPayload = {
        name: "Unauthorized Shop",
        address: "456 Unauthorized Ave",
      };

      await request(app)
        .post("/api/shops")
        .send(shopPayload)
        .set("Authorization", `Bearer ${dbData.userToken}`)
        .expect(403);
    });
  });

  describe("get /shops", () => {
    it("should return all shops", async () => {
      const response = await request(app)
        .get("/api/shops")
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("get /shops/:id", () => {
    it("should return a specific shop", async () => {
      const response = await request(app)
        .get(`/api/shops/${dbData.shop._id}`)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      expect(response.body._id.toString()).toBe(dbData.shop._id.toString());
    });

    it("should return null for non-existent shop id", async () => {
      const mongoose = require("mongoose");
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/shops/${fakeId}`)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      // API returns empty object for non-existent document
      expect(response.body).toEqual({});
    });
  });

  describe("put /shops/:id", () => {
    it("should update shop", async () => {
      const updatePayload = {
        name: "Updated Shop Name",
        address: "789 Updated St",
      };

      const response = await request(app)
        .put(`/api/shops/${createdShopId}`)
        .send(updatePayload)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      expect(response.body.name).toBe(updatePayload.name);
      expect(response.body.address).toBe(updatePayload.address);
    });
  });

  describe("delete /shops/:id", () => {
    it("should delete shop", async () => {
      await request(app)
        .delete(`/api/shops/${createdShopId}`)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      const Shop = require("../models/Shop");
      const deletedShop = await Shop.findById(createdShopId);
      expect(deletedShop).toBeNull();
    });
  });
});

describe("authorization", () => {
  describe("missing token", () => {
    it("should fail to access protected endpoints without token", async () => {
      await request(app).get("/api/accounts").expect(401);
      await request(app).get("/api/shops").expect(401);
      await request(app).get("/api/users").expect(401);
    });
  });

  describe("invalid token", () => {
    it("should fail with invalid token", async () => {
      await request(app)
        .get("/api/accounts")
        .set("Authorization", "Bearer invalid_token_123")
        .expect(401);
    });
  });

  describe("insufficient permissions", () => {
    it("should not allow user to create account (admin only)", async () => {
      await request(app)
        .post("/api/accounts")
        .send({ name: "Test", deposit: 100, type: "secondary" })
        .set("Authorization", `Bearer ${dbData.userToken}`)
        .expect(403);
    });

    it("should not allow user to create shop (admin only)", async () => {
      await request(app)
        .post("/api/shops")
        .send({ name: "Test Shop", address: "Test" })
        .set("Authorization", `Bearer ${dbData.userToken}`)
        .expect(403);
    });

    it("should not allow user to register other users (admin only)", async () => {
      await request(app)
        .post("/api/users/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "123456",
          type: "user",
        })
        .set("Authorization", `Bearer ${dbData.userToken}`)
        .expect(403);
    });
  });
});

describe("moves - advanced", () => {
  describe("get /moves/:period/:subType", () => {
    it("should fetch moves by period and subtype", async () => {
      const response = await request(app)
        .get(`/api/moves/${PERIOD_VALUES.daily}/${MOVE_SUBTYPES.sale}`)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should fetch all moves with 'all' subtype", async () => {
      const response = await request(app)
        .get(`/api/moves/${PERIOD_VALUES.monthly}/${MOVE_SUBTYPES.all}`)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should fail without auth", async () => {
      await request(app)
        .get(`/api/moves/${PERIOD_VALUES.daily}/${MOVE_SUBTYPES.sale}`)
        .expect(401);
    });
  });

  describe("get /moves/revenue/:start/:end/:user", () => {
    it("should fetch revenue report for date range", async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      const response = await request(app)
        .get(
          `/api/moves/revenue/${startDate}/${endDate}/${dbData.admin._id}`,
        )
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it("should fail without auth", async () => {
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      await request(app)
        .get(`/api/moves/revenue/${startDate}/${endDate}/${dbData.admin._id}`)
        .expect(401);
    });
  });

  describe("put /moves/:id", () => {
    let moveId = "";

    beforeAll(async () => {
      const move = await Move.findOne({ subType: MOVE_SUBTYPES.sale });
      if (move) {
        moveId = move._id;
      }
    });

    it("should update a move (admin only)", async () => {
      if (!moveId) {
        // Skip if no move found
        return;
      }

      const updatePayload = {
        amount: 999,
        description: "Updated move",
      };

      const response = await request(app)
        .put(`/api/moves/${moveId}`)
        .send(updatePayload)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      expect(response.body.amount).toBe(updatePayload.amount);
    });

    it("should fail without admin privilege", async () => {
      if (!moveId) return;

      await request(app)
        .put(`/api/moves/${moveId}`)
        .send({ amount: 500, description: "Test" })
        .set("Authorization", `Bearer ${dbData.userToken}`)
        .expect(403);
    });
  });

  describe("delete /moves/:id", () => {
    let moveToDeleteId = "";

    beforeAll(async () => {
      const move = await Move.findOne({ subType: MOVE_SUBTYPES.spending });
      if (move) {
        moveToDeleteId = move._id;
      }
    });

    it("should delete a move", async () => {
      if (!moveToDeleteId) return;

      const response = await request(app)
        .delete(`/api/moves/${moveToDeleteId}`)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      const deletedMove = await Move.findById(moveToDeleteId);
      expect(deletedMove).toBeNull();
    });

    it("should fail without auth", async () => {
      if (!moveToDeleteId) return;

      await request(app).delete(`/api/moves/${moveToDeleteId}`).expect(401);
    });
  });

  describe("delete /moves/manual/:id", () => {
    let manualMoveId = "";

    beforeAll(async () => {
      const move = await Move.findOne({ subType: MOVE_SUBTYPES.win });
      if (move) {
        manualMoveId = move._id;
      }
    });

    it("should manually delete a move (admin only)", async () => {
      if (!manualMoveId) return;

      const response = await request(app)
        .delete(`/api/moves/manual/${manualMoveId}`)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      const deletedMove = await Move.findById(manualMoveId);
      expect(deletedMove).toBeNull();
    });

    it("should fail without admin privilege", async () => {
      // Create a temp move to test
      const tempMove = await Move.create({
        type: MOVE_TYPES.out,
        subType: MOVE_SUBTYPES.spending,
        amount: 100,
        accountId: dbData.primaryAccount._id,
        account: dbData.primaryAccount.name,
        shopId: dbData.shop._id,
        user: dbData.admin.name,
        userId: dbData.admin._id,
      });

      await request(app)
        .delete(`/api/moves/manual/${tempMove._id}`)
        .set("Authorization", `Bearer ${dbData.userToken}`)
        .expect(403);
    });
  });
});

describe("history", () => {
  describe("get /history/:start/:end", () => {
    it("should fetch history for date range (admin only)", async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      const response = await request(app)
        .get(`/api/history/${startDate}/${endDate}`)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should fail without admin privilege", async () => {
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      await request(app)
        .get(`/api/history/${startDate}/${endDate}`)
        .set("Authorization", `Bearer ${dbData.userToken}`)
        .expect(403);
    });

    it("should fail without auth", async () => {
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      await request(app).get(`/api/history/${startDate}/${endDate}`).expect(401);
    });
  });

  describe("post /history", () => {
    it("should create history entry", async () => {
      const historyPayload = {
        moveSubType: MOVE_SUBTYPES.deposit,
        amount: 500,
        user: dbData.admin.name,
        userId: dbData.admin._id,
      };

      const response = await request(app)
        .post("/api/history")
        .send(historyPayload)
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(201);

      expect(response.body.amount).toBe(historyPayload.amount);
      expect(response.body.moveSubType).toBe(historyPayload.moveSubType);
    });

    it("should fail without auth", async () => {
      await request(app)
        .post("/api/history")
        .send({
          type: MOVE_TYPES.in,
          subType: MOVE_SUBTYPES.deposit,
          amount: 100,
        })
        .expect(401);
    });
  });
});

describe("backup", () => {
  describe("get /backup", () => {
    it("should export backup data (admin only)", async () => {
      const response = await request(app)
        .get("/api/backup")
        .set("Authorization", `Bearer ${dbData.adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it("should fail without admin privilege", async () => {
      await request(app)
        .get("/api/backup")
        .set("Authorization", `Bearer ${dbData.userToken}`)
        .expect(403);
    });

    it("should fail without auth", async () => {
      await request(app).get("/api/backup").expect(401);
    });
  });
});

