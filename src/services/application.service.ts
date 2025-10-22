import { OkPacket, RowDataPacket } from "mysql2";
import {
  Application,
  ApplicationFilters,
  ApplicationRequest,
  ApplicationUpdateRequest,
  GetAllApplications,
  GetByIdRequest,
  toApplicationResponse,
} from "../models/application.model";
import { ApplicationValidation } from "../validations/application.validation";
import { Validation } from "../validations/validate";
import pool from "../applications/db";
import { ResponseError } from "../errors/response.error";
import { Pagination, PaginationOption } from "../models/pagging.model";
import { deleteFileIfExist } from "../helper/delete-file";

export class ApplicationService {
  static async checkUser(userId: number) {
    const [user] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );
    if (user.length === 0) {
      throw new ResponseError(400, "User not found");
    }
  }

  static async create(
    request: ApplicationRequest,
    userId: number,
    file: Express.Multer.File
  ): Promise<Application> {
    await this.checkUser(userId);
    const validated = Validation.validate(
      ApplicationValidation.CREATE,
      request
    );

    const fileName = file ? `${file.filename}` : "";

    const [createApplication] = await pool.execute<OkPacket>(
      "INSERT INTO job_applications (userId,companyName,position,status,appliedAt,notes,cvFilePath) VALUES (?,?,?,?,?,?,?)",
      [
        userId,
        validated.companyName,
        validated.position,
        validated.status,
        validated.appliedAt,
        validated.notes,
        fileName,
      ]
    );
    const application = {
      id: createApplication.insertId,
      companyName: validated.companyName,
      position: validated.position,
      status: validated.status,
      appliedAt: validated.appliedAt,
      notes: validated.notes || "",
      cvFilePath: fileName,
    };
    return toApplicationResponse(application);
  }

  static async getById(
    userId: number,
    id: GetByIdRequest
  ): Promise<Application> {
    await this.checkUser(userId);

    const validated = Validation.validate(ApplicationValidation.GETBYID, id);

    const [application] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM job_applications WHERE id = ?",
      [validated.id]
    );
    if (application.length === 0) {
      throw new ResponseError(400, "Application not found");
    }
    const response = {
      id: application[0]?.id,
      companyName: application[0]?.companyName,
      position: application[0]?.position,
      status: application[0]?.status,
      appliedAt: application[0]?.appliedAt,
      notes: application[0]?.notes,
      cvFilePath: application[0]?.cvFilePath,
    };
    return toApplicationResponse(response);
  }

  static async getAll(
    userId: number,
    dataFilters: ApplicationFilters,
    dataPagination: PaginationOption
  ): Promise<Pagination<GetAllApplications>> {
    await this.checkUser(userId);
    const filters = Validation.validate(
      ApplicationValidation.FILTER,
      dataFilters
    );
    const pagination = Validation.validate(
      ApplicationValidation.PAGINATION,
      dataPagination
    );

    const { page, limit } = pagination;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params: any[] = [userId];

    if (filters.status) {
      conditions.push("status = ?");
      params.push(filters.status);
    }
    if (filters.position) {
      conditions.push("position = ?");
      params.push(filters.position);
    }
    if (filters.appliedAt) {
      conditions.push("appliedAt = ?");
      params.push(filters.appliedAt);
    }
    // Query data (Utama)
    let query = `SELECT id,companyName, position, status, appliedAt FROM job_applications WHERE userId = ?`;

    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ");
    }

    query += " ORDER BY appliedAt DESC LIMIT ? OFFSET ?";
    const dataParams = [...params, limit, offset];

    const [rows] = await pool.execute<RowDataPacket[]>(query, dataParams);
    const applications = rows.map((row) => ({
      id: row.id,
      companyName: row.companyName,
      position: row.position,
      status: row.status,
      appliedAt: row.appliedAt,
    }));

    let countQuery = `SELECT COUNT(*) AS total FROM job_applications WHERE userId = ?`;

    if (conditions.length > 0) {
      countQuery += " AND " + conditions.join(" AND ");
    }

    const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, params);
    const total = Number(countRows[0]!.total);
    const totalPage = Math.ceil(total / limit);

    return {
      data: applications,
      paging: {
        page,
        limit,
        total,
        totalPage,
      },
    };
  }

  static async update(
    userId: number,
    request: ApplicationUpdateRequest,
    file: Express.Multer.File
  ): Promise<Application> {
    await this.checkUser(userId);
    const validated = Validation.validate(
      ApplicationValidation.UPDATE,
      request
    );
    const [application] = await pool.execute<RowDataPacket[]>(
      "SELECT id, cvFilePath FROM job_applications WHERE id = ?",
      [validated.id]
    );

    if (application.length === 0) {
      throw new ResponseError(400, "Application not found");
    }
    if (file) {
      deleteFileIfExist(application[0]!.cvFilePath);
    }

    const fileName = file ? file.filename : application[0]!.cvFilePath;

    await pool.execute<OkPacket>(
      "UPDATE job_applications SET companyName = ?, position = ?, status = ?, appliedAt = ?, notes = ?, cvFilePath = ? WHERE id = ?",
      [
        validated.companyName,
        validated.position,
        validated.status,
        validated.appliedAt,
        validated.notes,
        fileName,
        validated.id,
      ]
    );

    const response = {
      id: validated.id,
      companyName: validated.companyName,
      position: validated.position,
      status: validated.status,
      appliedAt: validated.appliedAt,
      notes: validated.notes || "",
      cvFilePath: fileName,
    };
    return toApplicationResponse(response);
  }

  static async delete(id: GetByIdRequest, userId: number) {
    await this.checkUser(userId);
    const validated = Validation.validate(ApplicationValidation.GETBYID, id);

    const [application] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM job_applications WHERE id = ?",
      [validated.id]
    );

    if (application.length === 0) {
      throw new ResponseError(400, "Application not found");
    }
    if (application[0]!.cvFilePath !== null) {
      deleteFileIfExist(String(application[0]!.cvFilePath));
    }
    await pool.execute<OkPacket>("DELETE FROM job_applications WHERE id = ?", [
      validated.id,
    ]);

    return {
      id: validated.id,
      message: "Application deleted successfully",
    };
  }
}
