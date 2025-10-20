import { ZodType } from "zod";

export class Validation {
  static validate<T>(schema: ZodType, data: T) {
    const result = schema.parse(data);
    return result as T;
  }
}
