/**
 * Resume Fetcher Service
 * Handles PDF download and text extraction from URLs
 */

import pdfParse from "pdf-parse";
import axios from "axios";

export async function downloadAndParsePDF(url: string): Promise<string> {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
    const pdfBuffer = Buffer.from(response.data);
    const parsed = await pdfParse(pdfBuffer);
    return parsed.text;
  } catch (error) {
    console.error("PDF download/parse failed:", error);
    return "";
  }
}

export function isPDFUrl(url: string): boolean {
  return url.toLowerCase().endsWith(".pdf");
}
