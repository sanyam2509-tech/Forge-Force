import type { Volunteer, Participant } from "./types";

export interface CsvParseResult<T> {
  rows: T[];
  errors: string[];
}

/**
 * Quote-aware CSV row splitter. Handles fields quoted with double-quotes,
 * including commas inside quoted fields (e.g. "photography, tech, social media").
 */
function splitCsvRow(line: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; } // escaped quote
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      cols.push(current.trim()); current = "";
    } else {
      current += ch;
    }
  }
  cols.push(current.trim());
  return cols;
}

// Parse volunteer CSV: columns name, skills, availability (header row required)
// Skills may be comma-separated within double quotes: "photography, tech, social media"
export function parseVolunteerCsv(text: string): CsvParseResult<Omit<Volunteer, "id">> {
  const lines = text.trim().split("\n").filter(l => l.trim().length > 0);
  if (lines.length < 2) return { rows: [], errors: ["CSV must have a header row and at least one data row"] };

  const headers = splitCsvRow(lines[0]).map(h => h.toLowerCase());
  const nameIdx = headers.indexOf("name");
  const skillsIdx = headers.indexOf("skills");
  const availIdx = headers.indexOf("availability");

  if (nameIdx === -1) return { rows: [], errors: ["CSV must have a 'name' column"] };

  const rows: Omit<Volunteer, "id">[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvRow(lines[i]);
    const name = cols[nameIdx]?.trim();
    if (!name) { errors.push(`Row ${i + 1}: missing name`); continue; }
    rows.push({
      name,
      skills: skillsIdx >= 0 ? (cols[skillsIdx]?.trim() ?? "") : "",
      availability: availIdx >= 0 ? (cols[availIdx]?.trim() ?? "Full day") : "Full day",
    });
  }
  return { rows, errors };
}

// Parse participant CSV: columns name, email (header row required)
export function parseParticipantCsv(text: string): CsvParseResult<Omit<Participant, "id">> {
  const lines = text.trim().split("\n").filter(l => l.trim().length > 0);
  if (lines.length < 2) return { rows: [], errors: ["CSV must have a header row and at least one data row"] };

  const headers = splitCsvRow(lines[0]).map(h => h.toLowerCase());
  const nameIdx = headers.indexOf("name");
  const emailIdx = headers.indexOf("email");

  if (nameIdx === -1 || emailIdx === -1) return { rows: [], errors: ["CSV must have 'name' and 'email' columns"] };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const rows: Omit<Participant, "id">[] = [];
  const errors: string[] = [];
  const seenEmails = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvRow(lines[i]);
    const name = cols[nameIdx]?.trim();
    const email = cols[emailIdx]?.trim().toLowerCase();

    if (!name) { errors.push(`Row ${i + 1}: missing name`); continue; }
    if (!email || !emailRegex.test(email)) { errors.push(`Row ${i + 1}: invalid email "${email}"`); continue; }
    if (seenEmails.has(email)) { errors.push(`Row ${i + 1}: duplicate email "${email}"`); continue; }

    seenEmails.add(email);
    rows.push({ name, email });
  }
  return { rows, errors };
}
