import { describe, it, expect } from "vitest";
import { parseVolunteerCsv, parseParticipantCsv } from "./csv";

describe("parseVolunteerCsv", () => {
  it("parses valid CSV correctly", () => {
    const csv = `name,skills,availability\nAlice,"photography, tech",Full day\nBob,social media,Morning only`;
    const result = parseVolunteerCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].name).toBe("Alice");
    expect(result.rows[0].skills).toBe("photography, tech");
    expect(result.rows[1].name).toBe("Bob");
  });

  it("returns error when name column is missing", () => {
    const csv = `skills,availability\nphotography,Full day`;
    const result = parseVolunteerCsv(csv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.rows).toHaveLength(0);
  });

  it("skips rows with missing names and adds error", () => {
    const csv = `name,skills,availability\n,photography,Full day\nAlice,tech,Morning only`;
    const result = parseVolunteerCsv(csv);
    expect(result.errors).toHaveLength(1);
    expect(result.rows).toHaveLength(1);
  });

  it("returns error for empty file", () => {
    const result = parseVolunteerCsv("");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.rows).toHaveLength(0);
  });

  it("handles extra whitespace", () => {
    const csv = `name , skills , availability\n Alice , tech , Full day `;
    const result = parseVolunteerCsv(csv);
    expect(result.rows[0].name).toBe("Alice");
    expect(result.rows[0].skills).toBe("tech");
  });
});

describe("parseParticipantCsv", () => {
  it("parses valid CSV correctly", () => {
    const csv = `name,email\nAlice,alice@example.com\nBob,bob@example.com`;
    const result = parseParticipantCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].email).toBe("alice@example.com");
  });

  it("rejects invalid email", () => {
    const csv = `name,email\nAlice,not-an-email`;
    const result = parseParticipantCsv(csv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.rows).toHaveLength(0);
  });

  it("rejects duplicate emails", () => {
    const csv = `name,email\nAlice,alice@example.com\nAlice2,alice@example.com`;
    const result = parseParticipantCsv(csv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.rows).toHaveLength(1);
  });

  it("returns error when columns are missing", () => {
    const csv = `name,phone\nAlice,123456`;
    const result = parseParticipantCsv(csv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.rows).toHaveLength(0);
  });
});
