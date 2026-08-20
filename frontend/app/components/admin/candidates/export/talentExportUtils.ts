import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportTalent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  headline: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  availability: string;
  socialLinks: string[];
};

const PRIMARY_COLOR = "#087F5B";
const LIGHT_BG = "#E8F7F0";

export function exportTalentsToExcel(
  talents: ExportTalent[],
  fileName = "talents-export",
): void {
  const headers = [
    "Full Name",
    "Email",
    "Phone",
    "Headline",
    "Location",
    "Skills",
    "Experience",
    "Education",
    "Availability",
    "LinkedIn",
    "GitHub",
    "Portfolio/Other",
  ];

  const data = talents.map((t) => [
    t.name,
    t.email,
    t.phone || "-",
    t.headline,
    t.location || "-",
    t.skills.join(", "),
    t.experience,
    t.education,
    t.availability,
    t.socialLinks.find((l) => l.includes("linkedin")) || "-",
    t.socialLinks.find((l) => l.includes("github")) || "-",
    t.socialLinks
      .filter((l) => !l.includes("linkedin") && !l.includes("github"))
      .join(", ") || "-",
  ]);

  // Build worksheet manually for full styling control
  const ws: any = {};
  const range = {
    s: { r: 0, c: 0 },
    e: { r: data.length + 3, c: headers.length - 1 },
  };
  ws["!ref"] = XLSX.utils.encode_range(range);

  // Column widths
  ws["!cols"] = [
    { wch: 25 },
    { wch: 35 },
    { wch: 18 },
    { wch: 45 },
    { wch: 22 },
    { wch: 50 },
    { wch: 15 },
    { wch: 40 },
    { wch: 15 },
    { wch: 35 },
    { wch: 35 },
    { wch: 35 },
  ];

  // Merges for header section
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // HIRELENS title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Subtitle
    { s: { r: 0, c: 9 }, e: { r: 0, c: 11 } }, // Date
    { s: { r: 1, c: 9 }, e: { r: 1, c: 11 } }, // Count
  ];

  // Title Row 0: HIRELENS
  ws["A1"] = {
    v: "HIRELENS",
    s: {
      font: { bold: true, sz: 20, color: { rgb: "286EF0" } },
      fill: { fgColor: { rgb: "F3F4FF" } },
      alignment: { horizontal: "left", vertical: "center" },
    },
  };

  // Row 0: Date (right side)
  ws["J1"] = {
    v: `Generated: ${new Date().toLocaleDateString()}`,
    s: {
      font: { italic: true, sz: 11, color: { rgb: "7C8493" } },
      fill: { fgColor: { rgb: "F3F4FF" } },
      alignment: { horizontal: "right", vertical: "center" },
    },
  };

  // Row 1: Subtitle
  ws["A2"] = {
    v: "Talent Pool Export",
    s: {
      font: { sz: 14, color: { rgb: "25324B" } },
      fill: { fgColor: { rgb: "F3F4FF" } },
      alignment: { horizontal: "left", vertical: "center" },
    },
  };

  // Row 1: Count (right side)
  ws["J2"] = {
    v: `${talents.length} Talents`,
    s: {
      font: { bold: true, sz: 12, color: { rgb: "286EF0" } },
      fill: { fgColor: { rgb: "F3F4FF" } },
      alignment: { horizontal: "right", vertical: "center" },
    },
  };

  // Row 2: Blue divider line
  for (let c = 0; c < 12; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c });
    ws[cellRef] = {
      v: "",
      s: {
        fill: { fgColor: { rgb: "286EF0" } },
        border: { bottom: { style: "thick", color: { rgb: "286EF0" } } },
      },
    };
  }

  // Row 3: Column Headers
  headers.forEach((header, c) => {
    const cellRef = XLSX.utils.encode_cell({ r: 3, c });
    ws[cellRef] = {
      v: header,
      s: {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        fill: { fgColor: { rgb: "286EF0" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "286EF0" } },
          bottom: { style: "thin", color: { rgb: "286EF0" } },
          left: { style: "thin", color: { rgb: "286EF0" } },
          right: { style: "thin", color: { rgb: "286EF0" } },
        },
      },
    };
  });

  // Data rows starting at row 4
  data.forEach((row, r) => {
    row.forEach((value, c) => {
      const cellRef = XLSX.utils.encode_cell({ r: r + 4, c });
      const isEven = r % 2 === 0;
      ws[cellRef] = {
        v: value,
        s: {
          font: { sz: 10, color: { rgb: "25324B" } },
          fill: { fgColor: { rgb: isEven ? "FFFFFF" : "F8F8FD" } },
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
          },
        },
      };
    });
  });

  // Footer row
  const footerRow = data.length + 4;
  ws[`A${footerRow + 1}`] = {
    v: ` HireLens Talent Pool - ${new Date().getFullYear()}`,
    s: {
      font: { italic: true, sz: 9, color: { rgb: "7C8493" } },
      alignment: { horizontal: "left" },
    },
  };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Talents");
  XLSX.writeFile(
    wb,
    `${fileName}-${new Date().toISOString().split("T")[0]}.xlsx`,
  );
}

export function exportTalentsToPDF(
  talents: ExportTalent[],
  fileName = "talents-export",
): void {
  const doc = new jsPDF("l", "mm", "a4"); // Landscape for more columns

  // Header with logo placeholder and title
  doc.setFillColor(243, 244, 255); // Light blue bg
  doc.rect(0, 0, 297, 25, "F");

  doc.setTextColor(40, 110, 240); // #087F5B
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("HIRELENS", 14, 17);

  doc.setTextColor(124, 132, 147); // #7C8493
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Talent Pool Export", 60, 17);

  doc.setTextColor(124, 132, 147);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 250, 17, {
    align: "right",
  });

  // Subtitle
  doc.setTextColor(37, 50, 75); // #25324B
  doc.setFontSize(11);
  doc.text(`Total Talents: ${talents.length}`, 14, 35);

  // Prepare table data
  const tableData = talents.map((t) => [
    t.name,
    t.email,
    t.phone || "-",
    t.headline.length > 40 ? t.headline.substring(0, 40) + "..." : t.headline,
    t.location || "-",
    t.skills.slice(0, 3).join(", ") + (t.skills.length > 3 ? "..." : ""),
    t.experience,
    t.availability,
  ]);

  // Generate table
  autoTable(doc, {
    head: [
      [
        "Name",
        "Email",
        "Phone",
        "Headline",
        "Location",
        "Skills",
        "Exp",
        "Status",
      ],
    ],
    body: tableData,
    startY: 40,
    theme: "striped",
    headStyles: {
      fillColor: [40, 110, 240], // #087F5B
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [243, 244, 255], // Light blue
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 45 },
      2: { cellWidth: 25 },
      3: { cellWidth: 50 },
      4: { cellWidth: 30 },
      5: { cellWidth: 40 },
      6: { cellWidth: 20 },
      7: { cellWidth: 25 },
    },
    didDrawPage: (data: { pageNumber: number }) => {
      // Footer on each page
      doc.setFontSize(8);
      doc.setTextColor(124, 132, 147);
      doc.text(
        `HireLens Talent Pool - Page ${data.pageNumber} of ${(doc as any).internal.getNumberOfPages()}`,
        14,
        doc.internal.pageSize.height - 10,
      );
    },
  });

  doc.save(`${fileName}-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function printTalents(talents: ExportTalent[]): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const rows = talents
    .map(
      (t) => `
    <tr>
      <td>${t.name}</td>
      <td>${t.email}</td>
      <td>${t.phone || "-"}</td>
      <td>${t.headline}</td>
      <td>${t.location || "-"}</td>
      <td>${t.skills.join(", ")}</td>
      <td>${t.experience}</td>
      <td>${t.education}</td>
      <td>${t.availability}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>HireLens Talent Pool - ${new Date().toLocaleDateString()}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.5; color: #25324B; }
        .header { background: #E8F7F0; padding: 20px; border-bottom: 3px solid #087F5B; }
        .header h1 { color: #087F5B; font-size: 24px; margin: 0; }
        .header .subtitle { color: #7C8493; font-size: 14px; margin-top: 4px; }
        .header .date { color: #7C8493; font-size: 12px; margin-top: 8px; }
        .content { padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #087F5B; color: white; padding: 12px 8px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; }
        td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #F8F8FD; }
        tr:hover { background: #E8F7F0; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 20px; background: white; border-top: 1px solid #e5e7eb; font-size: 10px; color: #7C8493; }
        .count { padding: 20px; font-size: 14px; font-weight: 600; color: #25324B; }
        @media print {
          .no-print { display: none; }
          .footer { position: fixed; bottom: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HIRELENS</h1>
        <div class="subtitle">Talent Pool Directory</div>
        <div class="date">Generated: ${new Date().toLocaleDateString()} | ${talents.length} talents</div>
      </div>
      <div class="count">Total Talents: ${talents.length}</div>
      <div class="content">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Headline</th>
              <th>Location</th>
              <th>Skills</th>
              <th>Experience</th>
              <th>Education</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <div class="footer">
        HireLens Talent Pool Export • ${new Date().toLocaleDateString()}
      </div>
      <script>
        window.onload = () => { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
