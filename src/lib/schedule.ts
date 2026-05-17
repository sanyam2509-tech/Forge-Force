import type { EventDocument, EventInput, PRTask, SubEvent, SuggestedAsset } from "@/lib/types";

function uid(prefix: string, index: number) {
  return `${prefix}-${index + 1}`;
}

export function getMainStartDate(input: EventInput) {
  return input.mainStartDate || input.eventDate;
}

export function getMainEndDate(input: EventInput) {
  return input.mainEndDate || input.mainStartDate || input.eventDate;
}

export function formatDateRange(input: EventInput) {
  const start = getMainStartDate(input);
  const end = getMainEndDate(input);
  const startTime = input.startTime || "09:00";
  const endTime = input.endTime || "18:00";
  if (!start) return "Date not set";
  if (start === end) return `${start} · ${startTime}-${endTime}`;
  return `${start} to ${end} · ${startTime}-${endTime}`;
}

function addHours(time: string, hours: number) {
  const [h = "9", m = "0"] = time.split(":");
  const date = new Date();
  date.setHours(Number(h) + hours, Number(m), 0, 0);
  return date.toTimeString().slice(0, 5);
}

function templateForEvent(input: EventInput) {
  const type = `${input.eventType} ${input.title}`.toLowerCase();
  if (/hackathon|demo|build/.test(type)) {
    return [
      ["Registration", "Check-in", "Collect arrivals, team status, and help desk issues"],
      ["Round 1: Idea Submission", "Submission", "Capture team ideas, problem statements, and eligibility"],
      ["Round 2: Build Sprint", "Build Round", "Run focused building with mentor routing and blocker support"],
      ["Mentor Feedback", "Mentoring", "Give teams structured feedback before final submission"],
      ["Final Pitch", "Demo", "Run timed presentations with judging rubric"],
      ["Judging", "Evaluation", "Score projects and resolve judging questions"],
      ["Result Announcement", "Closing", "Announce winners, next steps, feedback, and sponsor thanks"],
    ];
  }
  if (/workshop|training|class/.test(type)) {
    return [
      ["Registration", "Check-in", "Confirm attendance and setup readiness"],
      ["Intro Session", "Session", "Frame goals, agenda, and expected outcome"],
      ["Hands-on Activity", "Workshop", "Guide participants through practical exercises"],
      ["Q&A", "Support", "Resolve blockers and collect open questions"],
      ["Feedback Form", "Feedback", "Collect quality, usefulness, and follow-up data"],
    ];
  }
  if (/culture|cultural|social|performance|fest/.test(type)) {
    return [
      ["Registrations", "Registration", "Confirm participants, audience, and volunteer support"],
      ["Auditions", "Selection", "Screen performers and technical needs"],
      ["Practice Round", "Rehearsal", "Run sequence, stage movement, and AV checks"],
      ["Main Performance", "Performance", "Execute main show flow and crowd management"],
      ["Prize Distribution", "Closing", "Announce winners, capture content, and thank partners"],
    ];
  }
  if (/recruit|hiring|drive|career/.test(type)) {
    return [
      ["Application Window", "Application", "Collect candidate details and eligibility"],
      ["Screening Round", "Evaluation", "Review applications and shortlist candidates"],
      ["Interview Slots", "Interview", "Coordinate interview batches and interviewer notes"],
      ["Final Evaluation", "Selection", "Finalize decisions and backup candidates"],
      ["Result Communication", "Communication", "Send selection, waitlist, and rejection messages"],
    ];
  }
  return [
    ["Registration", "Check-in", "Confirm attendance and route participants"],
    ["Opening", "Session", "Orient attendees and set expectations"],
    ["Main Program", "Program", "Execute core agenda"],
    ["Networking / Activity", "Engagement", "Drive participation and capture content"],
    ["Closing", "Closing", "Share recap, feedback link, and next steps"],
  ];
}

export function suggestAssetsFor(input: EventInput, subEvent?: Pick<SubEvent, "name" | "type" | "startDate">): SuggestedAsset[] {
  const type = `${input.eventType} ${subEvent?.type ?? ""} ${subEvent?.name ?? ""}`.toLowerCase();
  const neededBy = subEvent?.startDate || getMainStartDate(input);
  const base: Omit<SuggestedAsset, "id">[] = [];

  if (/hackathon|submission|build|demo|judging/.test(type)) {
    base.push(
      { name: "Team Registration Form", purpose: "Capture team members, contact, eligibility, and track", requiredFields: ["Team name", "Members", "Contact", "Track"], priority: "High", neededBy },
      { name: "Idea Submission Form", purpose: "Collect problem statement and initial idea before build", requiredFields: ["Team", "Problem", "Solution", "Tech stack"], priority: "High", neededBy },
      { name: "Project Submission Form", purpose: "Collect final demo link, repo, pitch deck, and team details", requiredFields: ["Demo link", "Repo", "Deck", "Team"], priority: "High", neededBy },
      { name: "Judging Rubric", purpose: "Standardize scoring across judges", requiredFields: ["Innovation", "Execution", "Impact", "Presentation"], priority: "High", neededBy },
      { name: "Feedback Form", purpose: "Capture participant experience and improvement data", requiredFields: ["Rating", "Best part", "Issues", "Follow-up"], priority: "Medium", neededBy }
    );
  } else if (/ctf|capture/.test(type)) {
    base.push(
      { name: "Team Registration Form", purpose: "Collect team members and handles", requiredFields: ["Team name", "Members", "Handles", "Contact"], priority: "High", neededBy },
      { name: "Rules Acknowledgement Form", purpose: "Confirm code of conduct and rules acceptance", requiredFields: ["Team", "Captain", "Acknowledgement"], priority: "High", neededBy },
      { name: "Score Verification Form", purpose: "Resolve scoring disputes and manual checks", requiredFields: ["Team", "Challenge", "Evidence", "Timestamp"], priority: "Medium", neededBy }
    );
  } else if (/robotics|hardware/.test(type)) {
    base.push(
      { name: "Team Registration Form", purpose: "Capture team and bot details", requiredFields: ["Team", "Bot name", "Members", "Contact"], priority: "High", neededBy },
      { name: "Hardware Checklist Form", purpose: "Verify equipment, battery, and safety readiness", requiredFields: ["Bot type", "Battery", "Tools", "Spares"], priority: "High", neededBy },
      { name: "Safety Declaration Form", purpose: "Confirm safety compliance before arena access", requiredFields: ["Team", "Captain", "Safety acknowledgement"], priority: "High", neededBy }
    );
  } else if (/prompt|ai|wars/.test(type)) {
    base.push(
      { name: "Participant Registration Form", purpose: "Collect participant details and AI tool access", requiredFields: ["Name", "Email", "Tool access", "Experience"], priority: "High", neededBy },
      { name: "Submission Form", purpose: "Collect final prompt, output, and explanation", requiredFields: ["Participant", "Prompt", "Output", "Rationale"], priority: "High", neededBy },
      { name: "Judging Rubric", purpose: "Score creativity, effectiveness, and clarity", requiredFields: ["Creativity", "Accuracy", "Presentation"], priority: "High", neededBy }
    );
  } else if (/workshop|training|activity|q&a|feedback/.test(type)) {
    base.push(
      { name: "Registration Form", purpose: "Confirm attendees and prerequisites", requiredFields: ["Name", "Email", "Skill level", "Device status"], priority: "High", neededBy },
      { name: "Attendance Form", purpose: "Track live participation", requiredFields: ["Name", "Email", "Session attended"], priority: "Medium", neededBy },
      { name: "Feedback Form", purpose: "Measure clarity and usefulness", requiredFields: ["Rating", "Learning outcome", "Questions"], priority: "High", neededBy },
      { name: "Certificate Data Form", purpose: "Collect names for certificates", requiredFields: ["Full name", "Email", "Affiliation"], priority: "Low", neededBy }
    );
  } else if (/recruit|application|interview|selection/.test(type)) {
    base.push(
      { name: "Application Form", purpose: "Collect applicant profile and eligibility", requiredFields: ["Name", "Email", "Resume", "Role"], priority: "High", neededBy },
      { name: "Interview Slot Form", purpose: "Schedule interviews without manual back-and-forth", requiredFields: ["Candidate", "Slot", "Panel", "Contact"], priority: "High", neededBy },
      { name: "Evaluation Rubric", purpose: "Standardize candidate scoring", requiredFields: ["Skills", "Communication", "Fit", "Notes"], priority: "High", neededBy },
      { name: "Selection Email Templates", purpose: "Send consistent outcome communication", requiredFields: ["Candidate", "Status", "Next step"], priority: "Medium", neededBy }
    );
  } else {
    base.push(
      { name: "Registration Form", purpose: "Collect attendee or participant details", requiredFields: ["Name", "Email", "Phone", "Category"], priority: "High", neededBy },
      { name: "Volunteer Signup Form", purpose: "Capture volunteer availability and skills", requiredFields: ["Name", "Availability", "Skills", "Contact"], priority: "Medium", neededBy },
      { name: "Audience Feedback Form", purpose: "Measure experience and collect testimonials", requiredFields: ["Rating", "Favorite moment", "Issues", "Quote"], priority: "Medium", neededBy }
    );
  }

  return base.map((asset, index) => ({ ...asset, id: uid("asset", index) }));
}

export function suggestPRTasksFor(input: EventInput, subEvent: Pick<SubEvent, "id" | "name" | "startDate" | "type" | "coordinatorName">): PRTask[] {
  const owner = subEvent.coordinatorName || "Marketing Lead";
  const deadline = subEvent.startDate || getMainStartDate(input);
  return [
    { id: `${subEvent.id}-pr-1`, title: `Publish ${subEvent.name} registration announcement`, channel: "Instagram + WhatsApp", priority: "High", deadline, owner, status: "Todo" },
    { id: `${subEvent.id}-pr-2`, title: `Create teaser post for ${subEvent.name}`, channel: "Instagram", priority: "Medium", deadline, owner, status: "Todo" },
    { id: `${subEvent.id}-pr-3`, title: `Share ${subEvent.name} registration form in campus groups`, channel: "WhatsApp", priority: "High", deadline, owner, status: "Todo" },
    { id: `${subEvent.id}-pr-4`, title: `Create countdown story for ${subEvent.name}`, channel: "Instagram Stories", priority: "Medium", deadline, owner, status: "Todo" },
    { id: `${subEvent.id}-pr-5`, title: `Send final reminder for ${subEvent.name}`, channel: "Email + WhatsApp", priority: "High", deadline, owner, status: "Todo" },
  ];
}

export function suggestDocumentsFor(input: EventInput, subEvent?: Pick<SubEvent, "id" | "name" | "type">): EventDocument[] {
  if (!subEvent) {
    return [
      ["master-brief", "Master Event Brief", "Single-page festival thesis, goals, audience, and operating model"],
      ["sponsor-outline", "Sponsorship Deck Outline", "Sponsor story, audience value, packages, and visibility moments"],
      ["master-schedule", "Master Schedule", "Cross-event date/time grid with locations and owner map"],
      ["logistics-checklist", "Logistics Checklist", "Venue, AV, signage, help desk, crowd flow, and supplies"],
      ["volunteer-handbook", "Volunteer Handbook", "Roles, escalation paths, scripts, and station instructions"],
      ["pr-calendar", "Overall PR Calendar", "Central calendar for announcements, reminders, reels, and countdowns"],
    ].map(([id, name, purpose]) => ({
      id,
      name,
      scope: "Parent" as const,
      purpose,
      content: `${name}\n\nPurpose: ${purpose}\n\nEvent: ${input.title}\nWindow: ${formatDateRange(input)}\n\nKey sections:\n- Objective\n- Owners\n- Timeline\n- Risks\n- Next actions`,
      priority: "High" as const,
      ready: false,
    }));
  }

  return [
    "Registration Form Draft",
    "Rulebook",
    "Judging Rubric",
    "Participant Guidelines",
    "Coordinator Checklist",
    "Volunteer Checklist",
    "WhatsApp Announcement",
    "Email Announcement",
    "Feedback Form",
    "Certificate Data Form",
    "Post-Event Report",
  ].map((name, index) => ({
    id: `${subEvent.id}-doc-${index + 1}`,
    name,
    scope: "Sub-Event" as const,
    subEventId: subEvent.id,
    purpose: `${name} for ${subEvent.name}`,
    content: `${name}\n\nSub-event: ${subEvent.name}\nType: ${subEvent.type}\n\nDraft sections:\n- Purpose\n- Required information\n- Owner\n- Deadline\n- Review checklist`,
    priority: index < 5 ? "High" as const : "Medium" as const,
    ready: false,
  }));
}

export function suggestSubEvents(input: EventInput): SubEvent[] {
  const startDate = getMainStartDate(input);
  const endDate = getMainEndDate(input);
  const startTime = input.startTime || "09:00";
  const templates = templateForEvent(input);

  return templates.map(([name, type, description], index) => {
    const segmentStart = addHours(startTime, index);
    const segmentEnd = addHours(segmentStart, 1);
    const subEvent: SubEvent = {
      id: uid("subevent", index),
      name,
      type,
      startDate,
      endDate,
      startTime: segmentStart,
      endTime: segmentEnd,
      expectedAudience: input.audienceSize,
      description,
      roundNumber: /round|audition|screening|interview/i.test(name) ? String(index + 1) : "",
      location: input.venue || "Main venue / platform",
      actualRegistrations: "",
      coordinatorName: "",
      coordinatorContact: "",
      requiredVolunteers: String(Math.max(2, Math.ceil((Number(input.audienceSize) || 100) / 75))),
      volunteerNames: "",
      status: "Planning",
    };
    return {
      ...subEvent,
      assets: suggestAssetsFor(input, subEvent).slice(0, 3),
      prTasks: suggestPRTasksFor(input, subEvent),
      documents: suggestDocumentsFor(input, subEvent).slice(0, 6),
    };
  });
}

export function suggestAscentTechFest(input?: Partial<EventInput>): EventInput {
  const parent: EventInput = {
    title: "Ascent Tech Fest 2026",
    eventType: "Tech Festival",
    audienceType: "College students, builders, founders, and tech communities",
    audienceSize: "2500",
    eventDate: "2026-03-06",
    mainStartDate: "2026-03-06",
    mainEndDate: "2026-03-08",
    startTime: "09:00",
    endTime: "20:00",
    eventGoal: "Run a flagship multi-day technology festival with strong registrations, smooth operations, visible PR, sponsor value, and high-quality competitions.",
    tone: "Energetic",
    additionalNotes: "Support parallel sub-events, separate coordinators, volunteer teams, PR calendar, documents, forms, and cross-event command center.",
    volunteerNames: "42",
    venue: "Main Campus Convention Block",
    ...input,
  };

  const specs = [
    ["Anvil Hackathon", "Hackathon", "2026-03-06", "2026-03-08", "10:00", "17:00", "650", "420", "Aarav Mehta", "aarav@ascent.tech", "12", "Hall A + Build Zone", "Registration Open"],
    ["Ship to Scale", "Startup Pitch", "2026-03-06", "2026-03-06", "14:00", "18:00", "300", "180", "Meera Rao", "meera@ascent.tech", "6", "Seminar Hall 1", "Planning"],
    ["Robotics", "Robotics Challenge", "2026-03-07", "2026-03-07", "10:00", "16:00", "400", "260", "Kabir Sethi", "kabir@ascent.tech", "10", "Robotics Arena", "Registration Open"],
    ["CTF", "Cybersecurity CTF", "2026-03-07", "2026-03-08", "11:00", "15:00", "350", "210", "Nisha Verma", "nisha@ascent.tech", "8", "Lab Block", "Planning"],
    ["PromptWars", "AI Prompt Battle", "2026-03-08", "2026-03-08", "10:00", "13:00", "250", "190", "Dev Shah", "dev@ascent.tech", "5", "AI Lab", "Ready"],
    ["Override", "Flagship Tech Showdown", "2026-03-08", "2026-03-08", "15:00", "19:00", "600", "360", "Ira Kapoor", "ira@ascent.tech", "9", "Main Auditorium", "Planning"],
  ] as const;

  parent.subEvents = specs.map((spec, index) => {
    const [name, type, startDate, endDate, startTime, endTime, expectedAudience, actualRegistrations, coordinatorName, coordinatorContact, requiredVolunteers, location, status] = spec;
    const subEvent: SubEvent = {
      id: uid("ascent", index),
      name,
      type,
      startDate,
      endDate,
      startTime,
      endTime,
      expectedAudience,
      actualRegistrations,
      coordinatorName,
      coordinatorContact,
      requiredVolunteers,
      volunteerNames: Array.from({ length: Number(requiredVolunteers) }, (_, i) => `${name.split(" ")[0]} Volunteer ${i + 1}`).join(", "),
      location,
      status: status as SubEvent["status"],
      description: `${name} is a dedicated ${type.toLowerCase()} track inside Ascent Tech Fest with separate registrations, coordinator ownership, volunteer coverage, forms, PR, and execution milestones.`,
      roundNumber: "",
    };
    return {
      ...subEvent,
      assets: suggestAssetsFor(parent, subEvent),
      prTasks: suggestPRTasksFor(parent, subEvent),
      documents: suggestDocumentsFor(parent, subEvent),
    };
  });

  return parent;
}

export function validateSchedule(input: EventInput) {
  const warnings: string[] = [];
  const start = getMainStartDate(input);
  const end = getMainEndDate(input);
  if (start && end && end < start) warnings.push("Main event end date cannot be before start date.");
  if (start === end && input.startTime && input.endTime && input.endTime <= input.startTime) {
    warnings.push("Main event end time should be after start time.");
  }

  const subEvents = input.subEvents ?? [];
  subEvents.forEach((event) => {
    if (event.startDate < start || event.endDate > end) {
      warnings.push(`${event.name} falls outside the main event date range.`);
    }
    if (event.startDate === event.endDate && event.endTime <= event.startTime) {
      warnings.push(`${event.name} ends before it starts.`);
    }
    if (!event.expectedAudience && /round|main|final|performance|pitch|interview/i.test(event.name)) {
      warnings.push(`${event.name} is missing expected audience/participants.`);
    }
  });

  for (let i = 0; i < subEvents.length; i++) {
    for (let j = i + 1; j < subEvents.length; j++) {
      const a = subEvents[i];
      const b = subEvents[j];
      const aStart = `${a.startDate}T${a.startTime}`;
      const aEnd = `${a.endDate}T${a.endTime}`;
      const bStart = `${b.startDate}T${b.startTime}`;
      const bEnd = `${b.endDate}T${b.endTime}`;
      if (aStart < bEnd && bStart < aEnd) {
        warnings.push(`${a.name} overlaps with ${b.name}.`);
      }
    }
  }
  return warnings;
}

export function collectSuggestedAssets(input: EventInput) {
  const map = new Map<string, SuggestedAsset>();
  suggestAssetsFor(input).forEach((asset) => map.set(asset.name, asset));
  (input.subEvents ?? []).forEach((event) => {
    (event.assets ?? suggestAssetsFor(input, event)).forEach((asset) => {
      map.set(`${event.name}-${asset.name}`, {
        ...asset,
        name: asset.name,
        neededBy: asset.neededBy || event.startDate,
      });
    });
  });
  return Array.from(map.values());
}

export function collectDocuments(input: EventInput) {
  const docs = [...suggestDocumentsFor(input)];
  (input.subEvents ?? []).forEach((event) => {
    docs.push(...(event.documents ?? suggestDocumentsFor(input, event)));
  });
  return docs;
}

export function collectPRTasks(input: EventInput) {
  return (input.subEvents ?? []).flatMap((event) => event.prTasks ?? suggestPRTasksFor(input, event));
}
