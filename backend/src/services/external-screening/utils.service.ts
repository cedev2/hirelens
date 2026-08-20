/**
 * Utils Service
 * Shared utilities for external screening
 */

import fs from "fs";

export function cleanupUploadedFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Failed to cleanup uploaded file:", error);
  }
}

export function sanitizeText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 10000);
}
