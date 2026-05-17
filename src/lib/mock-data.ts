import type {
  ChecklistItem,
  CommunicationItem,
  EventBrief,
  EventInput,
  GeneratedWorkspace,
  SocialMediaIdea,
  TimelinePhase,
} from "@/lib/types";

type Urgency = "crisis" | "sprint" | "planned" | "strategic";

function getDaysUntil(eventDate: string) {
  const date = new Date(`${eventDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 30;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
}

function getUrgency(daysUntil: number): Urgency {
  if (daysUntil <= 3) return "crisis";
  if (daysUntil <= 14) return "sprint";
  if (daysUntil <= 60) return "planned";
  return "strategic";
}

function getScale(size: number) {
  if (size >= 500) return "large-scale";
  if (size >= 150) return "mid-scale";
  return "focused";
}

function eventHas(input: EventInput, pattern: RegExp) {
  return pattern.test(`${input.eventType} ${input.title} ${input.eventGoal ?? ""}`);
}

function deadline(urgency: Urgency, planned: string, sprint: string, crisis: string) {
  if (urgency === "crisis") return crisis;
  if (urgency === "sprint") return sprint;
  return planned;
}

function audienceLabel(input: EventInput) {
  return `${input.audienceSize} ${input.audienceType.toLowerCase()}`;
}

function getFormattedDate(eventDate: string) {
  return eventDate
    ? new Date(`${eventDate}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "the event date";
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateOffset(eventDate: string, days: number) {
  const date = new Date(`${eventDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function getOperationalFocus(urgency: Urgency) {
  if (urgency === "crisis") {
    return "rapid confirmation, attendee reminders, volunteer briefing, venue readiness, and same-day command flow";
  }
  if (urgency === "sprint") {
    return "promotion push, final vendor checks, speaker readiness, volunteer assignment, and attendee communication";
  }
  if (urgency === "planned") {
    return "registration growth, sponsor and speaker coordination, marketing rhythm, and operational owner assignment";
  }
  return "venue strategy, sponsorship outreach, partner development, content architecture, and launch planning";
}

function getEventSpecificTasks(input: EventInput) {
  if (eventHas(input, /hackathon|demo|build/i)) {
    return [
      "Confirm judging rubric, finalist demo order, mentor office hours, and prize handoff owner",
      "Prepare participant support desk for API keys, Wi-Fi issues, charger requests, and team formation",
    ];
  }

  if (eventHas(input, /workshop|training|class/i)) {
    return [
      "Validate workshop exercises, starter files, facilitator notes, and attendee setup instructions",
      "Prepare support flow for participants who fall behind during hands-on sections",
    ];
  }

  if (eventHas(input, /conference|summit|speaker/i)) {
    return [
      "Confirm speaker green room flow, stage cues, session transitions, and audience Q&A handling",
      "Prepare sponsor visibility moments across welcome remarks, signage, and recap content",
    ];
  }

  return [
    "Confirm run-of-show, owner handoffs, escalation channel, and attendee support flow",
    "Prepare capture plan for photos, quotes, testimonials, and post-event proof points",
  ];
}

function buildChecklist(input: EventInput, urgency: Urgency, scale: string): ChecklistItem[] {
  const eventSpecific = getEventSpecificTasks(input);
  const needsOverflow = scale !== "focused";

  const tasks: ChecklistItem[] = [
    {
      id: "chk-1",
      category: "Command & Ownership",
      task: "Lock the event command channel, decision owner, escalation path, and day-of response cadence",
      priority: "high",
      completed: false,
      deadline: deadline(urgency, "This week", "Today", "Next 2 hours"),
      owner: "Event Lead",
    },
    {
      id: "chk-2",
      category: "Venue & Logistics",
      task:
        urgency === "strategic"
          ? "Shortlist venues against capacity, AV, Wi-Fi density, accessibility, and sponsor visibility requirements"
          : "Confirm venue access time, room layout, signage, AV, Wi-Fi load, power strips, and emergency contacts",
      priority: "high",
      completed: false,
      deadline: deadline(urgency, "2-4 weeks before event", "48 hours before event", "Today"),
      owner: "Logistics Lead",
    },
    {
      id: "chk-3",
      category: "Registration",
      task:
        needsOverflow
          ? "Set up QR check-in lanes, overflow queue flow, badge sorting, and help-desk fallback for missing registrations"
          : "Verify registration list, QR check-in, badge names, and on-site help desk flow",
      priority: "high",
      completed: false,
      deadline: deadline(urgency, "2 weeks before event", "3 days before event", "Today"),
      owner: "Registration Lead",
    },
    {
      id: "chk-4",
      category: "Volunteer Operations",
      task: "Assign volunteers to registration, logistics, content capture, attendee support, and runner roles with briefing notes",
      priority: "high",
      completed: false,
      deadline: deadline(urgency, "10 days before event", "48 hours before event", "Today"),
      owner: "Volunteer Coordinator",
    },
    {
      id: "chk-5",
      category: "Communication",
      task:
        urgency === "crisis"
          ? "Send final attendee reminder with arrival time, location, agenda, contact number, and what to bring"
          : "Schedule launch, reminder, last-call, and day-before attendee messages across email and community channels",
      priority: "high",
      completed: false,
      deadline: deadline(urgency, "Launch this week", "Next 24 hours", "Next 2 hours"),
      owner: "Comms Lead",
    },
    {
      id: "chk-6",
      category: "Marketing",
      task:
        urgency === "strategic"
          ? "Build launch calendar with partner posts, speaker reveals, sponsor proof, and conversion checkpoints"
          : "Run a short-form content push with countdown posts, behind-the-scenes clips, speaker/mentor proof, and clear CTA",
      priority: urgency === "crisis" ? "medium" : "high",
      completed: false,
      deadline: deadline(urgency, "6-8 weeks before event", "This week", "Today"),
      owner: "Marketing Lead",
    },
    {
      id: "chk-7",
      category: "Program",
      task: eventSpecific[0],
      priority: "high",
      completed: false,
      deadline: deadline(urgency, "3 weeks before event", "72 hours before event", "Today"),
      owner: "Program Lead",
    },
    {
      id: "chk-8",
      category: "Attendee Experience",
      task: eventSpecific[1],
      priority: "medium",
      completed: false,
      deadline: deadline(urgency, "2 weeks before event", "48 hours before event", "Today"),
      owner: "Experience Lead",
    },
    {
      id: "chk-9",
      category: "Content Capture",
      task: "Prepare shot list for arrivals, crowd energy, team moments, sponsor visibility, winners, and three attendee quotes",
      priority: "medium",
      completed: false,
      deadline: deadline(urgency, "1 week before event", "48 hours before event", "Today"),
      owner: "Media Lead",
    },
    {
      id: "chk-10",
      category: "Post-Event",
      task: "Prepare recap email, photo folder, feedback form, sponsor thank-you note, and public highlights thread",
      priority: "medium",
      completed: false,
      deadline: deadline(urgency, "1 week before event", "Day before event", "Before doors open"),
      owner: "Community Lead",
    },
  ];

  return tasks.map((task, index) => {
    const dueOffsets =
      urgency === "crisis"
        ? [-1, -1, -1, -1, -1, -1, -1, -1, -1, 0]
        : urgency === "sprint"
          ? [-7, -5, -4, -3, -3, -2, -2, -2, -1, 0]
          : urgency === "planned"
            ? [-35, -28, -21, -14, -14, -10, -7, -7, -5, -1]
            : [-75, -70, -56, -42, -35, -30, -21, -14, -10, -3];
    return {
      ...task,
      dueDate: dateOffset(input.eventDate, dueOffsets[index] ?? -1),
    };
  });
}

function buildTimeline(input: EventInput, urgency: Urgency): TimelinePhase[] {
  const strategicBefore = [
    ["Now", "Define event thesis, success metrics, budget guardrails, and owner map"],
    ["8-10 weeks before", "Secure venue/sponsor pipeline and launch partner outreach"],
    ["6 weeks before", "Open registration, announce first proof point, and start speaker/mentor onboarding"],
    ["3 weeks before", "Confirm program blocks, volunteer leads, vendor needs, and content calendar"],
    ["1 week before", "Run ops rehearsal, finalize attendee reminders, and lock day-of command center"],
  ];

  const plannedBefore = [
    ["Now", "Lock venue, registration page, owner map, and promotion calendar"],
    ["4 weeks before", "Confirm speakers/mentors, sponsor mentions, and content capture plan"],
    ["2 weeks before", "Assign volunteers, publish agenda, and send attendee prep email"],
    ["1 week before", "Run AV/check-in test and push countdown campaign"],
    ["Day before", "Send final reminder, print materials, brief volunteers, and confirm vendor arrival"],
  ];

  const sprintBefore = [
    ["Today", "Confirm venue, AV, registration list, volunteer count, and escalation channel"],
    ["Next 24 hours", "Send invite push and attendee reminder with clear CTA"],
    ["3-5 days before", "Run volunteer briefing and prepare check-in/support scripts"],
    ["48 hours before", "Confirm catering, signage, run-of-show, and content capture roles"],
    ["Day before", "Send final reminder, stage social posts, and test check-in flow"],
  ];

  const crisisBefore = [
    ["Now", "Create command channel and assign one owner for logistics, comms, volunteers, and program"],
    ["Next 2 hours", "Confirm venue access, AV, Wi-Fi, registration list, and emergency contact"],
    ["Today", "Send final attendee reminder with agenda, arrival time, and support contact"],
    ["Tonight", "Brief volunteers, freeze run-of-show, and prepare signage/check-in materials"],
    ["Event morning", "Run 20-minute readiness check before doors open"],
  ];

  const before =
    urgency === "crisis"
      ? crisisBefore
      : urgency === "sprint"
        ? sprintBefore
        : urgency === "planned"
          ? plannedBefore
          : strategicBefore;

  return [
    {
      phase: "before",
      tasks: before.map(([timing, task]) => ({ timing, task })),
    },
    {
      phase: "during",
      tasks: [
        {
          timing: "T-90 min",
          task: "Open command center, test AV/Wi-Fi, place signage, and verify volunteer posts",
        },
        {
          timing: "Doors open",
          task: "Run fast check-in, capture arrival energy, and route support issues to the right owner",
        },
        {
          timing: "Mid-event",
          task: "Monitor schedule drift, attendee energy, social capture, and critical task blockers",
        },
        {
          timing: "Closing",
          task: "Deliver closing script, collect feedback, capture winners/outcomes, and announce next step",
        },
      ],
    },
    {
      phase: "after",
      tasks: [
        {
          timing: "Same day",
          task: "Send thank-you note, feedback link, sponsor mention, and first highlight post",
        },
        {
          timing: "Within 48 hours",
          task: "Publish recap, photo folder, top quotes, and community follow-up CTA",
        },
        {
          timing: "Within 1 week",
          task: "Review metrics, document lessons, and convert highlights into the next event launch asset",
        },
      ],
    },
  ];
}

function buildCommunication(input: EventInput, urgency: Urgency, formattedDate: string): CommunicationItem[] {
  const { title, eventType, audienceType, audienceSize } = input;
  const urgencyLine =
    urgency === "crisis"
      ? "Final details are locked. Please read this once before arriving."
      : urgency === "sprint"
        ? "We are in final prep mode, and spots are moving quickly."
        : "Registration is open, and the operating plan is already taking shape.";

  return [
    {
      type: "whatsapp",
      label: urgency === "crisis" ? "Final WhatsApp Reminder" : "WhatsApp Launch",
      content: `*${title}* is coming up on ${formattedDate}.\n\n${urgencyLine}\n\nWho it is for: ${audienceType}\nExpected size: ${audienceSize}\nFormat: ${eventType}\n\nReply with questions before event day so the team can keep check-in and support smooth.`,
    },
    {
      type: "instagram",
      label: "Launch Caption",
      content: `${title} is built for ${audienceType.toLowerCase()} who want a sharper, more useful ${eventType.toLowerCase()} experience.\n\nWhat to expect:\n- Clear agenda\n- Real participation\n- Strong community energy\n- Useful outcomes, not just noise\n\n${formattedDate}\nSave this post and tag the person who should come with you.\n\n#${title.replace(/\s+/g, "")} #${eventType.replace(/\s+/g, "")} #EventOps #Community`,
    },
    {
      type: "reminder",
      label: "Day-Before Reminder",
      content: `Reminder: ${title} is on ${formattedDate}.\n\nBefore you arrive:\n- Check the agenda\n- Bring ID and a charged device if needed\n- Arrive 15 minutes early for check-in\n- Save the organizer contact\n\nWe are keeping the experience tight, useful, and on schedule.`,
    },
    {
      type: "email",
      label: "Operational Email",
      content: `Subject: Your ${title} event brief and arrival details\n\nHi [Name],\n\nYou are confirmed for ${title} on ${formattedDate}.\n\nThis ${eventType.toLowerCase()} is designed for ${audienceLabel(input)} and focused on ${input.eventGoal || "a useful, high-energy event experience"}.\n\nArrival checklist:\n- Arrive 15 minutes before the start time\n- Keep your confirmation handy\n- Follow on-site signage for check-in\n- Ask the help desk for support at any point\n\nWe look forward to seeing you there.\n\nThe ${title} team`,
    },
  ];
}

function buildSocial(input: EventInput, urgency: Urgency, formattedDate: string): SocialMediaIdea[] {
  const title = input.title;
  const hashtag = title.replace(/\s+/g, "");
  const audience = input.audienceType.toLowerCase();
  const urgencyHook =
    urgency === "crisis"
      ? "Final call"
      : urgency === "sprint"
        ? "Countdown mode"
        : "Launch week";

  return [
    {
      type: "teaser",
      title: "Launch Strategy: Proof-First Announcement",
      description: `Lead with why ${audience} should care: outcome, people, and energy. Post a carousel with slide 1 as "${title}: built for ${audience}", slide 2 with the promise, slide 3 with agenda proof, slide 4 with what attendees get, and slide 5 with the CTA.`,
      caption: `${urgencyHook}: ${title} is live.\n\nThis is not another passive ${input.eventType.toLowerCase()}. Expect momentum, useful connections, and a room designed around action.\n\n${formattedDate}\nTag one person who should be there.\n\n#${hashtag} #${input.eventType.replace(/\s+/g, "")} #CommunityBuilding`,
    },
    {
      type: "countdown",
      title: "Countdown Campaign: 5 Proof Drops",
      description: "Run a 5-touch countdown: agenda reveal, venue/setup clip, speaker or mentor proof, volunteer/team prep, final what-to-bring reminder. Each post should answer one reason to attend.",
      caption: `The countdown to ${title} starts now.\n\nEvery day we are dropping one reason this event is worth showing up for.\n\nToday: the outcome. You leave with momentum, contacts, and something concrete to show for your time.`,
    },
    {
      type: "reel",
      title: "Reel Hooks: Creator-Grade Shortform",
      description: `Use three hooks: "POV: your event actually has operations", "What ${audience} need before ${title}", and "The 10-second setup check before doors open". Cut between agenda, team prep, badges, venue, and command center screen.`,
      caption: `Behind every smooth event is a slightly intense ops plan.\n\n${title} is being built for flow: check-in, reminders, volunteers, content, and a tight closing moment.\n\nSee you on ${formattedDate}.`,
    },
    {
      type: "story",
      title: "Interactive Story Ideas",
      description: "Use polls for session preference, question sticker for attendee concerns, countdown sticker for reminders, quiz sticker for event facts, and repost templates for attendees to share they are coming.",
      caption: `Help shape ${title}.\n\nVote in stories, send your questions, and tell us what you want the event team to make frictionless before you arrive.`,
    },
  ];
}

export function generateMockWorkspace(input: EventInput): GeneratedWorkspace {
  const { title, eventType, audienceType, audienceSize, eventDate } = input;
  const size = Number(audienceSize) || 100;
  const daysUntil = getDaysUntil(eventDate);
  const urgency = getUrgency(daysUntil);
  const scale = getScale(size);
  const formattedDate = getFormattedDate(eventDate);
  const operationalFocus = getOperationalFocus(urgency);

  const brief: EventBrief = {
    summary: `${title} is a ${scale} ${eventType.toLowerCase()} for ${audienceLabel(input)} running ${input.mainEndDate && input.mainEndDate !== eventDate ? `from ${eventDate} to ${input.mainEndDate}` : `on ${formattedDate}`}. EventOS is prioritizing ${operationalFocus}, because the event is ${daysUntil <= 0 ? "imminent" : `${daysUntil} day${daysUntil === 1 ? "" : "s"} away`}.${input.subEvents?.length ? ` The plan includes ${input.subEvents.length} sub-events or rounds that require milestone-level coordination.` : ""}`,
    objectives: [
      `Deliver a smooth ${eventType.toLowerCase()} with clear owner handoffs, visible attendee support, and no critical day-of ambiguity`,
      `Create a high-signal experience for ${audienceType.toLowerCase()} through relevant programming, fast communication, and practical outcomes`,
      `Capture proof of impact through attendee feedback, social highlights, sponsor visibility, and a reusable post-event recap`,
    ],
    audience: `${title} is planned for ${audienceLabel(input)}. The operating model should assume ${scale} crowd flow, clear signage, fast check-in, and communication that removes uncertainty before people arrive.`,
    executionGoals: [
      "Keep every high-priority operational area owned by a named lead before event day",
      "Maintain a single command channel for blockers, volunteer routing, attendee issues, and schedule drift",
      "Turn event-day activity into post-event momentum through recap assets, testimonials, and follow-up CTAs",
    ],
  };

  return {
    brief,
    checklist: buildChecklist(input, urgency, scale),
    timeline: buildTimeline(input, urgency),
    communication: buildCommunication(input, urgency, formattedDate),
    socialMedia: buildSocial(input, urgency, formattedDate),
  };
}
