import request from "supertest";
import app from "../src/applications/app";
import logger from "../src/applications/logging";
import pool from "../src/applications/db";
import bcrypt from "bcryptjs";

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
    logger.info(response.body);
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
    const refreshToken = response.headers["set-cookie"]?.[0]!.split(";")[0];
    logger.info(refreshToken);
    logger.info(response.body);
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
    logger.info(login.body);

    const response = await request(app)
      .post("/api/auth/logout")
      .set({
        authorization: `Bearer ${login.body.token}`,
      })
      .send();
    const cookie = response.headers["set-cookie"]?.[0]!.split(";")[0];
    logger.info(cookie);
    logger.info(response.body);
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
    logger.info(oldToken);
    const refresToken = login.headers["set-cookie"]?.[0]!.split(";")[0];

    const response = await request(app).post("/api/auth/refresh").set({
      cookie: refresToken,
    });
    const newToken = response.body.token;
    logger.info(newToken);
    logger.debug(oldToken === newToken);
    expect(response.status).toBe(200);
  });
});
