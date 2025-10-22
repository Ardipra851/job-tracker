import request from "supertest";
import app from "../src/applications/app";
import pool from "../src/applications/db";
import bcrypt from "bcryptjs";

afterAll(async () => {
  pool.end();
});

describe("Register", () => {
  afterEach(async () => {
    await pool.execute("DELETE FROM users WHERE email = ?", [
      "8oV6I@example.com",
    ]);
  });

  it("should register a user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "8oV6I@example.com",
      password: "123456",
    });
    expect(response.status).toBe(201);
  });
});

describe("Login", () => {
  beforeEach(async () => {
    const hashPassword = await bcrypt.hash("123456", 10);
    await pool.execute(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      ["John Doe", "8oV6I@example.com", hashPassword]
    );
  });
  afterEach(async () => {
    await pool.execute("DELETE FROM users WHERE email = ?", [
      "8oV6I@example.com",
    ]);
  });

  it("should login a user", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "8oV6I@example.com",
      password: "123456",
    });
    expect(response.status).toBe(200);
  });
});

describe("Logout", () => {
  beforeEach(async () => {
    const hashPassword = await bcrypt.hash("123456", 10);
    await pool.execute(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      ["John Doe", "8oV6I@example.com", hashPassword]
    );
  });
  afterEach(async () => {
    await pool.execute("DELETE FROM users WHERE email = ?", [
      "8oV6I@example.com",
    ]);
  });

  it("should logout a user", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "8oV6I@example.com",
      password: "123456",
    });

    const response = await request(app)
      .post("/api/auth/logout")
      .set({
        authorization: `Bearer ${login.body.token}`,
      })
      .send();
    expect(response.status).toBe(200);
  });
});

describe("Refresh token", () => {
  beforeEach(async () => {
    const hashPassword = await bcrypt.hash("123456", 10);
    await pool.execute(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      ["John Doe", "8oV6I@example.com", hashPassword]
    );
  });
  afterEach(async () => {
    await pool.execute("DELETE FROM users WHERE email = ?", [
      "8oV6I@example.com",
    ]);
  });

  it("should refresh token", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "8oV6I@example.com",
      password: "123456",
    });
    const oldToken = login.body.token;
    const refresToken = login.headers["set-cookie"]?.[0]!.split(";")[0];

    const response = await request(app).post("/api/auth/refresh").set({
      cookie: refresToken,
    });
    expect(response.status).toBe(200);
  });
});
