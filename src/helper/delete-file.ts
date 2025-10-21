import fs from "fs";
import path from "path";

export function deleteFileIfExist(relativePath: string): void {
  const fullPath = path.join(__dirname, "..", "uploads/cv/", relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}
