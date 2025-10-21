import request from "supertest";
import app from "../src/applications/app";
import pool from "../src/applications/db";
import bcrypt from "bcryptjs";
import logger from "../src/applications/logging";
import path from "path";
import fs from "fs";
import { RowDataPacket } from "mysql2";
import { createJobApplication, jobApplications } from "./utils";

afterAll(async () => {
  pool.end();
});

describe("Create", () => {
  beforeEach(async () => {
    const hashPassword = await bcrypt.hash("123456", 10);
    await pool.execute(
      "INSERT INTO users (id,name,email,password) VALUES (?,?,?,?)",
      [1, "John Doe", "8oV6I@example.com", hashPassword]
    );
  });
  afterEach(async () => {
    await pool.execute("DELETE FROM users WHERE email = ?", [
      "8oV6I@example.com",
    ]);
    await pool.execute("DELETE FROM job_applications WHERE userId = ?", [1]);

    const uploadDir = path.join(__dirname, "../uploads/cv");
    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach((file) => {
        fs.unlinkSync(path.join(uploadDir, file));
      });
    }
  });
  it("should create an application", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "8oV6I@example.com",
      password: "123456",
    });
    const response = await request(app)
      .post("/api/applications")
      .set({
        authorization: `Bearer ${login.body.token}`,
      })
      .field("companyName", "Google")
      .field("position", "Software Engineer")
      .field("status", "applied")
      .field("appliedAt", "2022-01-01")
      .field("notes", "This is a test application")
      .attach("cv", "tests/test.pdf");
    logger.info(response.body);
    expect(response.status).toBe(201);
  });
});

describe("Get By Id", () => {
  beforeEach(async () => {
    const hashPassword = await bcrypt.hash("123456", 10);
    await pool.execute(
      "INSERT INTO users (id,name,email,password) VALUES (?,?,?,?)",
      [1, "John Doe", "8oV6I@example.com", hashPassword]
    );
    await pool.execute(
      "INSERT INTO job_applications (userId,companyName,position,status,appliedAt,notes,cvFilePath) VALUES (?,?,?,?,?,?,?)",
      [
        1,
        "Google",
        "Software Engineer",
        "applied",
        "2022-01-01",
        "This is a test application",
        "test.pdf",
      ]
    );
  });
  afterEach(async () => {
    await pool.execute("DELETE FROM users WHERE email = ?", [
      "8oV6I@example.com",
    ]);
    await pool.execute("DELETE FROM job_applications WHERE userId = ?", [1]);

    const uploadDir = path.join(__dirname, "../uploads/cv");
    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach((file) => {
        fs.unlinkSync(path.join(uploadDir, file));
      });
    }
  });
  it("should get an application by Id", async () => {
    const [applicationId] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM job_applications WHERE userId = ?",
      [1]
    );

    const login = await request(app).post("/api/auth/login").send({
      email: "8oV6I@example.com",
      password: "123456",
    });
    const response = await request(app)
      .get(`/api/applications/${applicationId[0].id}`)
      .set({
        authorization: `Bearer ${login.body.token}`,
      })
      .send();
    // logger.info(response.body);
    expect(response.status).toBe(200);
  });
});

describe("Get All Applications", () => {
  beforeEach(async () => {
    const hashPassword = await bcrypt.hash("123456", 10);
    await pool.execute(
      "INSERT INTO users (id,name,email,password) VALUES (?,?,?,?)",
      [1, "John Doe", "8oV6I@example.com", hashPassword]
    );
    await jobApplications();
  });
  afterEach(async () => {
    await pool.execute("DELETE FROM users WHERE email = ?", [
      "8oV6I@example.com",
    ]);
    await pool.execute("DELETE FROM job_applications WHERE userId = ?", [1]);

    const uploadDir = path.join(__dirname, "../uploads/cv");
    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach((file) => {
        fs.unlinkSync(path.join(uploadDir, file));
      });
    }
  });
  it("should get an application by Id", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "8oV6I@example.com",
      password: "123456",
    });
    const response = await request(app)
      .get(`/api/applications?status=applied&page=1&limit=10`)
      .set({
        authorization: `Bearer ${login.body.token}`,
      })
      .send();
    // logger.info(response.body);
    expect(response.status).toBe(200);
  });
});

describe("Get update by Id", () => {
  beforeEach(async () => {
    const hashPassword = await bcrypt.hash("123456", 10);
    await pool.execute(
      "INSERT INTO users (id,name,email,password) VALUES (?,?,?,?)",
      [1, "John Doe", "8oV6I@example.com", hashPassword]
    );
    await pool.execute(
      "INSERT INTO job_applications (userId,companyName,position,status,appliedAt,notes,cvFilePath) VALUES (?,?,?,?,?,?,?)",
      [
        1,
        "Google",
        "Software Engineer",
        "applied",
        "2022-01-01",
        "This is a test application",
        "test.pdf",
      ]
    );
  });
  afterEach(async () => {
    await pool.execute("DELETE FROM users WHERE email = ?", [
      "8oV6I@example.com",
    ]);
    await pool.execute("DELETE FROM job_applications WHERE userId = ?", [1]);

    const uploadDir = path.join(__dirname, "../uploads/cv");
    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach((file) => {
        fs.unlinkSync(path.join(uploadDir, file));
      });
    }
  });
  it("should update an application by Id", async () => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM job_applications WHERE userId = ?",
      [1]
    );
    expect(rows.length).toBe(1);
    const applicationId = rows[0].id;

    const login = await request(app).post("/api/auth/login").send({
      email: "8oV6I@example.com",
      password: "123456",
    });
    const response = await request(app)
      .put(`/api/applications/${applicationId}`)
      .set({
        authorization: `Bearer ${login.body.token}`,
      })
      .field("companyName", "Yahoo")
      .field("position", "Software Engineer")
      .field("status", "offer")
      .field("appliedAt", "2022-01-01")
      .field("notes", "This is a test application")
      .field("cvFilePath", "test.pdf");
    logger.info(response.body);
    expect(response.status).toBe(200);
  });
});

describe("Delete By Id", () => {
  beforeEach(async () => {
    const hashPassword = await bcrypt.hash("123456", 10);
    await pool.execute(
      "INSERT INTO users (id,name,email,password) VALUES (?,?,?,?)",
      [1, "John Doe", "8oV6I@example.com", hashPassword]
    );
    await pool.execute(
      "INSERT INTO job_applications (userId,companyName,position,status,appliedAt,notes,cvFilePath) VALUES (?,?,?,?,?,?,?)",
      [
        1,
        "Google",
        "Software Engineer",
        "applied",
        "2022-01-01",
        "This is a test application",
        "test.pdf",
      ]
    );
  });
  afterEach(async () => {
    await pool.execute("DELETE FROM users WHERE email = ?", [
      "8oV6I@example.com",
    ]);
    await pool.execute("DELETE FROM job_applications WHERE userId = ?", [1]);

    const uploadDir = path.join(__dirname, "../uploads/cv");
    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach((file) => {
        fs.unlinkSync(path.join(uploadDir, file));
      });
    }
  });
  it("should delete an application by Id", async () => {
    const [applicationId] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM job_applications WHERE userId = ?",
      [1]
    );

    const login = await request(app).post("/api/auth/login").send({
      email: "8oV6I@example.com",
      password: "123456",
    });
    const response = await request(app)
      .delete(`/api/applications/${applicationId[0].id}`)
      .set({
        authorization: `Bearer ${login.body.token}`,
      })
      .send();
    logger.debug(response.body);
    expect(response.status).toBe(200);
  });
});
