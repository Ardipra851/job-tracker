import { Response, NextFunction } from "express";
import { UserRequest } from "../models/user.request";
import {
  ApplicationFilters,
  ApplicationRequest,
  ApplicationUpdateRequest,
  GetByIdRequest,
} from "../models/application.model";
import { ApplicationService } from "../services/application.service";
import { PaginationOption } from "../models/pagging.model";
import logger from "../applications/logging";

export class ApplicationController {
  static async create(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const request: ApplicationRequest = req.body;
      const file = req.file;
      const response = await ApplicationService.create(request, userId, file!);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.user!.id);
      const id: GetByIdRequest = {
        id: Number(req.params.id),
      };
      // logger.debug(id);
      const response = await ApplicationService.getById(userId, id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.user!.id);
      const filters: ApplicationFilters = req.query;
      const pagination: PaginationOption = {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
      };
      const response = await ApplicationService.getAll(
        userId,
        filters,
        pagination
      );
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.user!.id);
      const request: ApplicationUpdateRequest =
        req.body as ApplicationUpdateRequest;
      request.id = Number(req.params.id);
      const file = req.file;
      const response = await ApplicationService.update(userId, request, file!);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.user!.id);
      const id: GetByIdRequest = {
        id: Number(req.params.id),
      };
      const response = await ApplicationService.delete(id, userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
