import { describe, it, expect } from "vitest";
import { generateMockWorkspace } from "./mock-data";
import type { EventInput } from "./types";

const sampleInput: EventInput = {
  title: "TechFest 2025",
  eventType: "Hackathon",
  audienceType: "Students",
  audienceSize: "200",
  eventDate: "2025-06-15",
  eventGoal: "Foster innovation",
  tone: "Energetic",
  additionalNotes: "Include workshops",
};

describe("generateMockWorkspace", () => {
  it("returns a valid GeneratedWorkspace with all required sections", () => {
    const workspace = generateMockWorkspace(sampleInput);

    expect(workspace).toHaveProperty("brief");
    expect(workspace).toHaveProperty("checklist");
    expect(workspace).toHaveProperty("timeline");
    expect(workspace).toHaveProperty("communication");
    expect(workspace).toHaveProperty("socialMedia");
  });

  it("brief has correct structure", () => {
    const { brief } = generateMockWorkspace(sampleInput);

    expect(typeof brief.summary).toBe("string");
    expect(brief.summary.length).toBeGreaterThan(0);
    expect(typeof brief.audience).toBe("string");
    expect(Array.isArray(brief.objectives)).toBe(true);
    expect(brief.objectives).toHaveLength(3);
    expect(Array.isArray(brief.executionGoals)).toBe(true);
    expect(brief.executionGoals).toHaveLength(3);
  });

  it("brief references the event title", () => {
    const { brief } = generateMockWorkspace(sampleInput);
    expect(brief.summary).toContain("TechFest 2025");
  });

  it("checklist has exactly 10 items with correct structure", () => {
    const { checklist } = generateMockWorkspace(sampleInput);

    expect(checklist).toHaveLength(10);
    checklist.forEach((item, index) => {
      expect(item.id).toBe(`chk-${index + 1}`);
      expect(typeof item.category).toBe("string");
      expect(typeof item.task).toBe("string");
      expect(["high", "medium", "low"]).toContain(item.priority);
      expect(item.completed).toBe(false);
    });
  });

  it("checklist covers expected categories", () => {
    const { checklist } = generateMockWorkspace(sampleInput);
    const categories = new Set(checklist.map((item) => item.category));

    expect(categories.size).toBeGreaterThanOrEqual(4);
  });

  it("timeline has 3 phases with correct task counts", () => {
    const { timeline } = generateMockWorkspace(sampleInput);

    expect(timeline).toHaveLength(3);

    const before = timeline.find((p) => p.phase === "before");
    const during = timeline.find((p) => p.phase === "during");
    const after = timeline.find((p) => p.phase === "after");

    expect(before).toBeDefined();
    expect(during).toBeDefined();
    expect(after).toBeDefined();

    expect(before!.tasks).toHaveLength(5);
    expect(during!.tasks).toHaveLength(4);
    expect(after!.tasks).toHaveLength(3);

    // Each task has task and timing fields
    before!.tasks.forEach((t) => {
      expect(typeof t.task).toBe("string");
      expect(typeof t.timing).toBe("string");
    });
  });

  it("communication has 4 items with correct types", () => {
    const { communication } = generateMockWorkspace(sampleInput);

    expect(communication).toHaveLength(4);

    const types = communication.map((c) => c.type);
    expect(types).toContain("whatsapp");
    expect(types).toContain("instagram");
    expect(types).toContain("reminder");
    expect(types).toContain("email");

    communication.forEach((item) => {
      expect(typeof item.label).toBe("string");
      expect(typeof item.content).toBe("string");
      expect(item.content.length).toBeGreaterThan(0);
    });
  });

  it("socialMedia has 4 items with correct types", () => {
    const { socialMedia } = generateMockWorkspace(sampleInput);

    expect(socialMedia).toHaveLength(4);

    const types = socialMedia.map((s) => s.type);
    expect(types).toContain("reel");
    expect(types).toContain("story");
    expect(types).toContain("teaser");
    expect(types).toContain("countdown");

    socialMedia.forEach((item) => {
      expect(typeof item.title).toBe("string");
      expect(typeof item.description).toBe("string");
      expect(typeof item.caption).toBe("string");
    });
  });

  it("generates different content for different event types", () => {
    const workspace1 = generateMockWorkspace(sampleInput);
    const workspace2 = generateMockWorkspace({
      ...sampleInput,
      title: "Corporate Summit 2025",
      eventType: "Conference",
    });

    expect(workspace1.brief.summary).not.toBe(workspace2.brief.summary);
  });

  it("handles minimal input (only required fields)", () => {
    const minimalInput: EventInput = {
      title: "Test Event",
      eventType: "Meetup",
      audienceType: "General Public",
      audienceSize: "50",
      eventDate: "2025-12-01",
      eventGoal: "",
      tone: "",
      additionalNotes: "",
    };

    const workspace = generateMockWorkspace(minimalInput);
    expect(workspace.brief.summary).toContain("Test Event");
    expect(workspace.checklist).toHaveLength(10);
    expect(workspace.timeline).toHaveLength(3);
    expect(workspace.communication).toHaveLength(4);
    expect(workspace.socialMedia).toHaveLength(4);
  });
});
