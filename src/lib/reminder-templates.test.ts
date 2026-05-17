import { describe, it, expect } from "vitest";
import { generateReminderSchedule } from "./reminder-templates";
import type { EventInput } from "./types";

const mockEventInput: EventInput = {
  title: "Tech Summit 2025",
  eventType: "conference",
  eventDate: "2025-09-15",
  venue: "Convention Center",
  audienceType: "professionals",
  audienceSize: "500",
  budget: "$50000",
  goals: "Networking and learning",
  additionalContext: "",
};

describe("generateReminderSchedule", () => {
  it("returns exactly 4 reminder items", () => {
    const reminders = generateReminderSchedule(mockEventInput, "");
    expect(reminders).toHaveLength(4);
  });

  it("has correct types in correct order", () => {
    const reminders = generateReminderSchedule(mockEventInput, "");
    expect(reminders[0].type).toBe("pre-event");
    expect(reminders[1].type).toBe("day-before");
    expect(reminders[2].type).toBe("day-of");
    expect(reminders[3].type).toBe("post-event");
  });

  it("each reminder has non-empty subject and body", () => {
    const reminders = generateReminderSchedule(mockEventInput, "");
    for (const r of reminders) {
      expect(r.subject.length).toBeGreaterThan(0);
      expect(r.body.length).toBeGreaterThan(0);
    }
  });

  it("event title appears in subjects", () => {
    const reminders = generateReminderSchedule(mockEventInput, "");
    for (const r of reminders) {
      expect(r.subject).toContain("Tech Summit 2025");
    }
  });

  it("HTML body contains structural tags", () => {
    const reminders = generateReminderSchedule(mockEventInput, "");
    for (const r of reminders) {
      expect(r.body).toContain("<div");
      expect(r.body).toContain("</div>");
    }
  });

  it("all reminders start with pending status and zero counts", () => {
    const reminders = generateReminderSchedule(mockEventInput, "");
    for (const r of reminders) {
      expect(r.status).toBe("pending");
      expect(r.sentCount).toBe(0);
      expect(r.demoCount).toBe(0);
      expect(r.failedCount).toBe(0);
      expect(r.results).toHaveLength(0);
    }
  });
});
