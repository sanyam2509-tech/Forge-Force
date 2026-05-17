import { describe, it, expect } from "vitest";
import { validateWorkspace } from "./validate-workspace";
import { generateMockWorkspace } from "./mock-data";
import type { EventInput } from "./types";

const sampleInput: EventInput = {
  title: "Test Event",
  eventType: "Hackathon",
  audienceType: "Students",
  audienceSize: "100",
  eventDate: "2025-06-15",
  eventGoal: "",
  tone: "",
  additionalNotes: "",
};

describe("validateWorkspace", () => {
  it("returns true for valid mock workspace", () => {
    const workspace = generateMockWorkspace(sampleInput);
    expect(validateWorkspace(workspace)).toBe(true);
  });

  it("returns false for null", () => {
    expect(validateWorkspace(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(validateWorkspace(undefined)).toBe(false);
  });

  it("returns false for a string", () => {
    expect(validateWorkspace("not an object")).toBe(false);
  });

  it("returns false for a number", () => {
    expect(validateWorkspace(42)).toBe(false);
  });

  it("returns false for empty object", () => {
    expect(validateWorkspace({})).toBe(false);
  });

  it("returns false when brief is missing", () => {
    const workspace = generateMockWorkspace(sampleInput);
    const { brief: _, ...rest } = workspace;
    void _;
    expect(validateWorkspace(rest)).toBe(false);
  });

  it("returns false when brief is not an object", () => {
    const workspace = generateMockWorkspace(sampleInput);
    expect(validateWorkspace({ ...workspace, brief: "string" })).toBe(false);
  });

  it("returns false when brief.summary is not a string", () => {
    const workspace = generateMockWorkspace(sampleInput);
    expect(
      validateWorkspace({
        ...workspace,
        brief: { ...workspace.brief, summary: 123 },
      })
    ).toBe(false);
  });

  it("returns false when brief.objectives is not an array", () => {
    const workspace = generateMockWorkspace(sampleInput);
    expect(
      validateWorkspace({
        ...workspace,
        brief: { ...workspace.brief, objectives: "not array" },
      })
    ).toBe(false);
  });

  it("returns false when brief.audience is not a string", () => {
    const workspace = generateMockWorkspace(sampleInput);
    expect(
      validateWorkspace({
        ...workspace,
        brief: { ...workspace.brief, audience: null },
      })
    ).toBe(false);
  });

  it("returns false when brief.executionGoals is not an array", () => {
    const workspace = generateMockWorkspace(sampleInput);
    expect(
      validateWorkspace({
        ...workspace,
        brief: { ...workspace.brief, executionGoals: {} },
      })
    ).toBe(false);
  });

  it("returns false when checklist is missing", () => {
    const workspace = generateMockWorkspace(sampleInput);
    const { checklist: _, ...rest } = workspace;
    void _;
    expect(validateWorkspace(rest)).toBe(false);
  });

  it("returns false when checklist is empty array", () => {
    const workspace = generateMockWorkspace(sampleInput);
    expect(validateWorkspace({ ...workspace, checklist: [] })).toBe(false);
  });

  it("returns false when checklist is not an array", () => {
    const workspace = generateMockWorkspace(sampleInput);
    expect(validateWorkspace({ ...workspace, checklist: "not array" })).toBe(
      false
    );
  });

  it("returns false when timeline is missing", () => {
    const workspace = generateMockWorkspace(sampleInput);
    const { timeline: _, ...rest } = workspace;
    void _;
    expect(validateWorkspace(rest)).toBe(false);
  });

  it("returns false when timeline is empty array", () => {
    const workspace = generateMockWorkspace(sampleInput);
    expect(validateWorkspace({ ...workspace, timeline: [] })).toBe(false);
  });

  it("returns false when communication is missing", () => {
    const workspace = generateMockWorkspace(sampleInput);
    const { communication: _, ...rest } = workspace;
    void _;
    expect(validateWorkspace(rest)).toBe(false);
  });

  it("returns false when communication is empty array", () => {
    const workspace = generateMockWorkspace(sampleInput);
    expect(validateWorkspace({ ...workspace, communication: [] })).toBe(false);
  });

  it("returns false when socialMedia is missing", () => {
    const workspace = generateMockWorkspace(sampleInput);
    const { socialMedia: _, ...rest } = workspace;
    void _;
    expect(validateWorkspace(rest)).toBe(false);
  });

  it("returns false when socialMedia is empty array", () => {
    const workspace = generateMockWorkspace(sampleInput);
    expect(validateWorkspace({ ...workspace, socialMedia: [] })).toBe(false);
  });

  it("returns true when all sections have at least one item", () => {
    const minimal = {
      brief: {
        summary: "test",
        objectives: ["obj1"],
        audience: "test",
        executionGoals: ["goal1"],
      },
      checklist: [
        {
          id: "1",
          category: "test",
          task: "test",
          priority: "high",
          completed: false,
        },
      ],
      timeline: [{ phase: "before", tasks: [{ task: "test", timing: "now" }] }],
      communication: [
        { type: "whatsapp", label: "test", content: "test" },
      ],
      socialMedia: [
        { type: "reel", title: "test", description: "test", caption: "test" },
      ],
    };
    expect(validateWorkspace(minimal)).toBe(true);
  });
});
