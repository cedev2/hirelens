/**
 * File Parser Service
 * Handles CSV and Excel spreadsheet parsing for external applicants
 */

import csv from "csv-parser";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { IExternalApplicant } from "../../types/external-screening.types";

export async function parseSpreadsheet(filePath: string): Promise<IExternalApplicant[]> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".csv") {
    return parseCSV(filePath);
  } else if (ext === ".xlsx" || ext === ".xls") {
    return parseExcel(filePath);
  }

  throw new Error("Unsupported file format. Only CSV and Excel files are allowed.");
}

function parseCSV(filePath: string): Promise<IExternalApplicant[]> {
  return new Promise((resolve, reject) => {
    const results: IExternalApplicant[] = [];
    let rowIndex = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data: any) => {
        rowIndex++;
        const applicant = mapRowToApplicant(data, `csv-row-${rowIndex}`);
        if (applicant.email) {
          results.push(applicant);
        }
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

function parseExcel(filePath: string): IExternalApplicant[] {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet);

  return rows
    .map((row: any, index: number) => mapRowToApplicant(row, `excel-row-${index + 1}`))
    .filter((a: IExternalApplicant) => a.email);
}

function mapRowToApplicant(row: any, id: string): IExternalApplicant {
  const firstName = row.firstName || row.first_name || row.FirstName || row["First Name"] || "";
  const lastName = row.lastName || row.last_name || row.LastName || row["Last Name"] || "";
  const email = row.email || row.Email || row.EMAIL || row["E-mail"] || "";
  const phone = row.phone || row.phone_number || row.Phone || row["Phone Number"] || "";
  const headline = row.headline || row.title || row.position || row.Headline || "";
  const resumeUrl = row.resumeUrl || row.resume_url || row.resume || row["Resume URL"] || row["Resume Link"] || "";

  return {
    id,
    firstName,
    lastName,
    email,
    phone,
    headline,
    resumeUrl,
    resumeText: "",
    source: "external",
    rawData: row,
  };
}
