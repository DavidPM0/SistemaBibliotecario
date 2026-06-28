import fs from "node:fs";
import path from "node:path";

const outPath = path.join(process.cwd(), "estructura-base-datos.pdf");

const lines = [
  "ESTRUCTURA DE BASE DE DATOS",
  "Proyecto: Taller Villanueva - Sistema de Gesti\u00f3n",
  "",
  "1) Tabla: users",
  "- id (string, PK)",
  "- fullName (string)",
  "- username (string)",
  "- role (enum: Administrador | Empleado)",
  "- status (enum: Activo | Inactivo)",
  "- lastAccess (string/ISO date)",
  "- password (string)",
  "",
  "2) Tabla: clients",
  "- id (string, PK)",
  "- type (enum: Persona Natural | Empresa)",
  "- name (string)",
  "- ruc (string)",
  "- address (string)",
  "- district (string)",
  "- phone (string)",
  "- email (string)",
  "- status (enum: Activo | Inactivo)",
  "- activeWorks (number)",
  "- contactPerson (string, nullable)",
  "",
  "3) Tabla: works",
  "- id (string, PK)",
  "- name (string)",
  "- clientId (string, FK -> clients.id)",
  "- clientName (string)",
  "- type (string)",
  "- status (enum: Presupuestando | En Progreso | Finalizado)",
  "- progress (number)",
  "- totalValue (number)",
  "- startDate (string/date)",
  "- dueDate (string/date)",
  "- delayDays (number)",
  "- description (string)",
  "- location (string)",
  "- budget (BudgetItem[])",
  "",
  "4) Subestructura: budget item (dentro de works)",
  "- id (string, PK logica)",
  "- materialId (string, FK -> materials.id)",
  "- materialName (string)",
  "- quantity (number)",
  "- unitCost (number)",
  "",
  "5) Tabla: materials",
  "- id (string, PK)",
  "- code (string)",
  "- name (string)",
  "- description (string)",
  "- category (string)",
  "- unit (string)",
  "- averageCost (number)",
  "- stock (number)",
  "- stockMin (number)",
  "- stockMax (number)",
  "- location (string)",
  "",
  "6) Tabla: payments",
  "- id (string, PK)",
  "- workId (string, FK -> works.id)",
  "- clientId (string, FK -> clients.id)",
  "- amount (number)",
  "- date (string/date)",
  "- dueDate (string/date)",
  "- status (enum: Pagado | Pendiente | Vencido)",
  "",
  "RELACIONES PRINCIPALES",
  "- clients (1) ---- (N) works",
  "- works (1) ---- (N) payments",
  "- clients (1) ---- (N) payments",
  "- works (1) ---- (N) budget items",
  "- materials (1) ---- (N) budget items",
  "",
  "Fuente: lib/types.ts y data/store.json",
];

function esc(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildContentStream(pageLines) {
  const leading = 14;
  let stream = "BT\n/F1 11 Tf\n50 770 Td\n";
  for (let i = 0; i < pageLines.length; i += 1) {
    const prefix = i === 0 ? "" : `0 ${leading * -1} Td\n`;
    stream += `${prefix}(${esc(pageLines[i])}) Tj\n`;
  }
  stream += "ET";
  return stream;
}

function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const pageChunks = chunk(lines, 48);

const objects = [];
const addObject = (content) => {
  objects.push(content);
  return objects.length;
};

const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
const pageIds = [];
const contentIds = [];

for (const pageLines of pageChunks) {
  const stream = buildContentStream(pageLines);
  const streamObject = `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`;
  const contentId = addObject(streamObject);
  contentIds.push(contentId);
  pageIds.push(addObject(""));
}

const pagesId = addObject("");
const catalogId = addObject("");

for (let i = 0; i < pageIds.length; i += 1) {
  objects[pageIds[i] - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`;
}

objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
const offsets = [0];

for (let i = 0; i < objects.length; i += 1) {
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";
for (let i = 1; i <= objects.length; i += 1) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

fs.writeFileSync(outPath, Buffer.from(pdf, "latin1"));
console.log(`PDF generado en: ${outPath}`);
