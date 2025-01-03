const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { app, server } = require("../index");
const User = require("../models/User");
const { connectDB, disconnectDB, dropDB, getMockToken } = require("./setup");

const adminToken = getMockToken("admin");

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await dropDB();
  await disconnectDB();
  await server.close();
});

// afterEach(async () => {
//   await dropDB();
// });

let userPayload = {
  name: "john",
  email: "john@example.com",
  password: "123456",
  type: "admin",
};

let createdUserId = "";

describe("post /register", () => {
  it("should return registered user", async () => {
    const response = await request(app)
      .post("/api/users/register")
      .send(userPayload)
      .set("Authorization", `Bearer ${adminToken}`);

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
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);
  });
});

describe("post /login", () => {
  it("should return jwt token", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({ email: userPayload.email, password: userPayload.password });

    console.log(response.body);

    expect(response.status).toBe(200);

    const token = response.header.token;
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });
});

describe("get /", () => {
  it("should return users", async () => {
    const payload = {
      name: userPayload.name,
      email: userPayload.email,
      type: userPayload.type,
    };

    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject(payload);
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
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(payload);

    const updatedUser = await User.findById(createdUserId);
    expect(updatedUser).toMatchObject(payload);
  });
});

describe("delete /", () => {
  it("should delete user", async () => {
    const response = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deletedUser = await User.findById(createdUserId);
    expect(deletedUser).toBeNull();
  });
});
