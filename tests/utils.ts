import pool from "../src/applications/db";

export const jobApplications = async () => {
  await pool.execute(
    "INSERT INTO job_applications (userId,companyName,position,status,appliedAt,notes,cvFilePath) VALUES (?,?,?,?,?,?,?)",
    [
      1,
      `Google`,
      `Software Engineer`,
      "applied",
      "2022-01-01",
      "This is a test application",
      "test.pdf",
    ]
  );
  await pool.execute(
    "INSERT INTO job_applications (userId,companyName,position,status,appliedAt,notes,cvFilePath) VALUES (?,?,?,?,?,?,?)",
    [
      1,
      `Yahoo`,
      `Product Manager`,
      "rejected",
      "2022-01-01",
      "This is a test application",
      "test.pdf",
    ]
  );
  await pool.execute(
    "INSERT INTO job_applications (userId,companyName,position,status,appliedAt,notes,cvFilePath) VALUES (?,?,?,?,?,?,?)",
    [
      1,
      `Facebook`,
      `Programmer`,
      "offer",
      "2022-01-01",
      "This is a test application",
      "test.pdf",
    ]
  );
};

export const createJobApplication = async () => {
  await pool.execute(
    "INSERT INTO job_applications (userId,companyName,position,status,appliedAt,notes,cvFilePath) VALUES (?,?,?,?,?,?,?)",
    [
      1,
      `Google`,
      `Software Engineer`,
      "applied",
      "2022-01-01",
      "This is a test application",
      "test.pdf",
    ]
  );
};
