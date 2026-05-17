import { NextResponse } from "next/server";
import type { EventInput } from "@/lib/types";
import { generateMockWorkspace } from "@/lib/mock-data";

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

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const systemPrompt = `You are an expert event operations planner. Generate a complete event operational workspace as JSON.
The response must be valid JSON matching this exact schema:
{
  "brief": { "summary": "string", "objectives": ["string"], "audience": "string", "executionGoals": ["string"] },
  "checklist": [{ "id": "string", "category": "string", "task": "string", "priority": "high|medium|low", "completed": false }],
  "timeline": [{ "phase": "before|during|after", "tasks": [{ "task": "string", "timing": "string" }] }],
  "communication": [{ "type": "whatsapp|instagram|reminder|email", "label": "string", "content": "string" }],
  "socialMedia": [{ "type": "reel|story|teaser|countdown", "title": "string", "description": "string", "caption": "string" }]
}

Requirements:
- brief: 3 objectives, 3 execution goals
- checklist: 10 items across categories (Venue & Logistics, Registration, Promotion, Speakers & Content, Photography & Media, Attendee Management), with ids like "chk-1" through "chk-10"
- timeline: 3 phases (before: 5 tasks, during: 4 tasks, after: 3 tasks)
- communication: 4 items (one each of whatsapp, instagram, reminder, email)
- socialMedia: 4 items (one each of reel, story, teaser, countdown)
- All content should be specific, actionable, and tailored to the event details provided.`;

        const userPrompt = `Generate a complete operational workspace for this event:
- Event Title: ${input.title}
- Event Type: ${input.eventType}
- Audience: ${input.audienceType}
- Expected Size: ${input.audienceSize} attendees
- Date: ${input.eventDate}
- Goal: ${input.eventGoal || "Not specified"}
- Tone/Vibe: ${input.tone || "Professional"}
- Additional Notes: ${input.additionalNotes || "None"}`;

        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              response_format: { type: "json_object" },
              temperature: 0.7,
            }),
          }
        );

        if (!response.ok) {
          console.error(
            "OpenAI API error:",
            response.status,
            await response.text()
          );
          // Fallback to mock data on API error
          const workspace = generateMockWorkspace(input);
          return NextResponse.json(workspace);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          const workspace = generateMockWorkspace(input);
          return NextResponse.json(workspace);
        }

        const parsed = JSON.parse(content);

        // Validate the response has all required sections
        if (
          !parsed.brief ||
          !parsed.checklist ||
          !parsed.timeline ||
          !parsed.communication ||
          !parsed.socialMedia
        ) {
          console.error("OpenAI response missing required sections");
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
