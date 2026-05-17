import { NextResponse } from "next/server";
import type { EventInput } from "@/lib/types";
import { generateMockWorkspace } from "@/lib/mock-data";
import { validateWorkspace } from "@/lib/validate-workspace";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

function getDaysUntil(eventDate: string) {
  const date = new Date(`${eventDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "unknown";
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return String(Math.ceil((date.getTime() - today.getTime()) / 86_400_000));
}

export async function POST(request: Request) {
  try {
    const input: EventInput = await request.json();

    // Validate required fields
    if (
      !input.title ||
      !input.eventType ||
      !input.audienceType ||
      !input.audienceSize ||
      !input.eventDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate audience size is a positive number
    const size = Number(input.audienceSize);
    if (!Number.isFinite(size) || size < 1) {
      return NextResponse.json(
        { error: "Invalid audience size" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const daysUntil = getDaysUntil(input.eventDate);
        const prompt = `You are EventOS AI, an operational intelligence agent for event teams. Generate a realistic, execution-ready event workspace as JSON.
The response must be valid JSON matching this exact schema:
{
  "brief": { "summary": "string", "objectives": ["string"], "audience": "string", "executionGoals": ["string"] },
  "checklist": [{ "id": "string", "category": "string", "task": "string", "priority": "high|medium|low", "completed": false, "deadline": "string (e.g. '4 weeks before event')", "owner": "string (e.g. 'Event Manager')" }],
  "timeline": [{ "phase": "before|during|after", "tasks": [{ "task": "string", "timing": "string" }] }],
  "communication": [{ "type": "whatsapp|instagram|reminder|email", "label": "string", "content": "string" }],
  "socialMedia": [{ "type": "reel|story|teaser|countdown", "title": "string", "description": "string", "caption": "string" }]
}

Requirements:
- brief: 3 objectives, 3 execution goals
- checklist: 10 items across categories (Venue & Logistics, Registration, Promotion, Speakers & Content, Photography & Media, Attendee Management), with ids like "chk-1" through "chk-10"
- checklist: each item must include deadline and owner fields
- timeline: 3 phases (before: 5 tasks, during: 4 tasks, after: 3 tasks)
- communication: 4 items (one each of whatsapp, instagram, reminder, email)
- socialMedia: 4 items (one each of reel, story, teaser, countdown)
- All content must be specific, actionable, operationally realistic, and tailored to the event details provided.
- Adapt every task, deadline, recommendation, and timeline item to event proximity.
- If the event is in 0-3 days: focus on final confirmations, reminders, volunteer briefing, run-of-show, AV/Wi-Fi, check-in, and crisis-proof day-of execution. Do not suggest long-lead tasks.
- If the event is in 4-14 days: focus on final promotion, attendee conversion, vendor confirmation, volunteer assignment, speaker readiness, and content scheduling.
- If the event is in 15-60 days: focus on marketing cadence, speaker/sponsor coordination, registration growth, owner assignment, and logistics validation.
- If the event is more than 60 days away: include venue/sponsor/partner strategy, but still keep tasks practical and sequenced.
- Social media ideas should include creator-grade hooks, countdown mechanics, audience engagement, and clear CTAs.
- Return ONLY the JSON object, no markdown formatting or code blocks.

Generate a complete operational workspace for this event:
- Event Title: ${input.title}
- Event Type: ${input.eventType}
- Audience: ${input.audienceType}
- Expected Size: ${input.audienceSize} attendees
- Date: ${input.eventDate}
- Main Event Range: ${input.mainStartDate || input.eventDate} to ${input.mainEndDate || input.mainStartDate || input.eventDate}
- Main Event Time: ${input.startTime || "Not specified"} to ${input.endTime || "Not specified"}
- Sub-Events / Rounds: ${
          input.subEvents?.length
            ? input.subEvents
                .map(
                  (event) =>
                    `${event.name} (${event.type}) ${event.startDate} ${event.startTime}-${event.endTime}, audience ${event.expectedAudience || "unknown"}, location ${event.location || "TBD"}`
                )
                .join("; ")
            : "None provided"
        }
- Days Until Event: ${daysUntil}
- Goal: ${input.eventGoal || "Not specified"}
- Tone/Vibe: ${input.tone || "Professional"}
- Additional Notes: ${input.additionalNotes || "None"}
- Volunteers: ${input.volunteerNames || "None provided"}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (!response.ok) {
          console.error(
            "Gemini API error:",
            response.status,
            await response.text()
          );
          const workspace = generateMockWorkspace(input);
          return NextResponse.json(workspace);
        }

        const data = await response.json();
        const content =
          data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
          const workspace = generateMockWorkspace(input);
          return NextResponse.json(workspace);
        }

        // Clean potential markdown code block wrapping
        const cleanedContent = content
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        const parsed = JSON.parse(cleanedContent);

        // Validate the full response structure
        if (!validateWorkspace(parsed)) {
          console.error("Gemini response failed schema validation");
          const workspace = generateMockWorkspace(input);
          return NextResponse.json(workspace);
        }

        return NextResponse.json(parsed);
      } catch (aiError) {
        console.error("AI generation failed, falling back to mock:", aiError);
        const workspace = generateMockWorkspace(input);
        return NextResponse.json(workspace);
      }
    }

    // No API key — use mock data
    const workspace = generateMockWorkspace(input);
    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate workspace" },
      { status: 500 }
    );
  }
}
