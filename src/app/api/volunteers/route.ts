import { NextResponse } from "next/server";
import type { EventInput, Volunteer, VolunteerAssignment } from "@/lib/types";
import { generateMockVolunteerAssignments } from "@/lib/mock-volunteers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventInput, volunteers }: { eventInput: EventInput; volunteers: Volunteer[] } = body;

    if (!eventInput?.title || !eventInput?.eventType) {
      return NextResponse.json({ error: "Missing event information" }, { status: 400 });
    }
    if (!Array.isArray(volunteers) || volunteers.length === 0) {
      return NextResponse.json({ error: "No volunteers provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const volunteerList = volunteers
          .map((v) => `ID: ${v.id} | Name: ${v.name} | Skills: ${v.skills || "General"} | Availability: ${v.availability || "Full day"}`)
          .join("\n");

        const prompt = `You are an event operations coordinator. Assign roles for a ${eventInput.eventType} event.

Event: "${eventInput.title}" | Type: ${eventInput.eventType} | Audience: ${eventInput.audienceType}, ${eventInput.audienceSize} attendees

Volunteers:
${volunteerList}

Role categories for ${eventInput.eventType}:
- Hackathon: Registration Desk, Technical Support, Mentor Coordination, Photography, Food Management, Social Media Coverage, Prize Distribution
- Workshop: Speaker Coordination, Attendee Management, AV Setup, Photography, Check-in Desk, Material Distribution
- Conference: Registration, Session Management, Speaker Escort, Logistics, Photography, Social Media
- Meetup: Welcome Desk, Setup Crew, Photography, Refreshments, Program Management
- Other: Operations Lead, Registration, Photography, Guest Management, Social Media, Tech Support, Logistics

Rules:
- Use the exact volunteer IDs provided
- Assign exactly one role per volunteer
- Match skills to roles where possible
- category must be exactly one of: "Core Operations", "Guest Experience", "Technical", "Media & Content", "Logistics"
- estimatedEffort like "2-3 hours", "4-5 hours", or "Full day"
- status must be "assigned"

Return ONLY a JSON array (no markdown), one object per volunteer:
[{"volunteerId":"string","volunteerName":"string","role":"string","category":"string","priority":"high|medium|low","estimatedEffort":"string","status":"assigned"}]`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            const cleaned = content.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/\s*```$/i,"").trim();
            const parsed: VolunteerAssignment[] = JSON.parse(cleaned);
            const validCategories = ["Core Operations","Guest Experience","Technical","Media & Content","Logistics"];
            const validPriorities = ["high","medium","low"];

            const returnedIds = new Set(parsed.map((a: VolunteerAssignment) => a.volunteerId));
            const isValid = Array.isArray(parsed) &&
              parsed.length === volunteers.length &&
              returnedIds.size === volunteers.length &&
              volunteers.every(v => returnedIds.has(v.id)) &&
              parsed.every((a: VolunteerAssignment) =>
                typeof a.volunteerName === "string" && a.volunteerName.trim().length > 0 &&
                typeof a.role === "string" && a.role.trim().length > 0 &&
                typeof a.estimatedEffort === "string" && a.estimatedEffort.trim().length > 0 &&
                validCategories.includes(a.category) &&
                validPriorities.includes(a.priority) &&
                a.status === "assigned"
              );
            if (isValid) {
              return NextResponse.json(parsed);
            }
          }
        }
      } catch (err) {
        console.error("Volunteer AI assignment failed, using mock:", err);
      }
    }

    return NextResponse.json(generateMockVolunteerAssignments(eventInput, volunteers));
  } catch (error) {
    console.error("Volunteer route error:", error);
    return NextResponse.json({ error: "Failed to assign volunteers" }, { status: 500 });
  }
}
