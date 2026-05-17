import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the route handler by importing it directly

describe("POST /api/generate", () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    // Dynamically import to get fresh module each time
    const mod = await import("./route");
    POST = mod.POST;
  });

  function makeRequest(body: Record<string, unknown>): Request {
    return new Request("http://localhost:3000/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  const validInput = {
    title: "TechFest 2025",
    eventType: "Hackathon",
    audienceType: "Students",
    audienceSize: "200",
    eventDate: "2025-06-15",
    eventGoal: "Foster innovation",
    tone: "Energetic",
    additionalNotes: "",
  };

  it("returns 400 when title is missing", async () => {
    const req = makeRequest({ ...validInput, title: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing required fields");
  });

  it("returns 400 when eventType is missing", async () => {
    const req = makeRequest({ ...validInput, eventType: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when audienceType is missing", async () => {
    const req = makeRequest({ ...validInput, audienceType: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when audienceSize is missing", async () => {
    const req = makeRequest({ ...validInput, audienceSize: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when eventDate is missing", async () => {
    const req = makeRequest({ ...validInput, eventDate: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for negative audience size", async () => {
    const req = makeRequest({ ...validInput, audienceSize: "-5" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid audience size");
  });

  it("returns 400 for zero audience size", async () => {
    const req = makeRequest({ ...validInput, audienceSize: "0" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid audience size");
  });

  it("returns 400 for non-numeric audience size", async () => {
    const req = makeRequest({ ...validInput, audienceSize: "abc" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid audience size");
  });

  it("returns 200 with mock workspace when no API key is set", async () => {
    // Ensure no GEMINI_API_KEY
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const req = makeRequest(validInput);
      const res = await POST(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty("brief");
      expect(body).toHaveProperty("checklist");
      expect(body).toHaveProperty("timeline");
      expect(body).toHaveProperty("communication");
      expect(body).toHaveProperty("socialMedia");

      // Verify structure
      expect(body.brief).toHaveProperty("summary");
      expect(body.brief).toHaveProperty("objectives");
      expect(body.brief).toHaveProperty("audience");
      expect(body.brief).toHaveProperty("executionGoals");
      expect(Array.isArray(body.checklist)).toBe(true);
      expect(body.checklist.length).toBe(10);
      expect(Array.isArray(body.timeline)).toBe(true);
      expect(body.timeline.length).toBe(3);
      expect(Array.isArray(body.communication)).toBe(true);
      expect(body.communication.length).toBe(4);
      expect(Array.isArray(body.socialMedia)).toBe(true);
      expect(body.socialMedia.length).toBe(4);
    } finally {
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it("returns 200 with valid workspace for minimal required fields", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const req = makeRequest({
        title: "Test",
        eventType: "Meetup",
        audienceType: "Students",
        audienceSize: "10",
        eventDate: "2025-01-01",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty("brief");
      expect(body.brief.summary).toContain("Test");
    } finally {
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it("returns 500 for malformed JSON body", async () => {
    const req = new Request("http://localhost:3000/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to generate workspace");
  });

  it("returns 400 for empty object body", async () => {
    const req = makeRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("personalizes mock data with event title", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const req = makeRequest({
        ...validInput,
        title: "UniqueEventName2099",
      });
      const res = await POST(req);
      const body = await res.json();
      expect(body.brief.summary).toContain("UniqueEventName2099");
    } finally {
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    }
  });
});
