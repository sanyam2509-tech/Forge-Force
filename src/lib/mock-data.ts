import type {
  EventInput,
  GeneratedWorkspace,
  EventBrief,
  ChecklistItem,
  TimelinePhase,
  CommunicationItem,
  SocialMediaIdea,
} from "@/lib/types";

export function generateMockWorkspace(input: EventInput): GeneratedWorkspace {
  const { title, eventType, audienceType, audienceSize, eventDate } = input;

  const brief: EventBrief = {
    summary: `${title} is a ${eventType.toLowerCase()} designed to bring together ${audienceType.toLowerCase()} for a day of learning, networking, and collaboration. This event aims to create a high-impact experience for approximately ${audienceSize} attendees, delivering value through curated content, interactive sessions, and meaningful connections.`,
    objectives: [
      `Deliver an outstanding ${eventType.toLowerCase()} experience that exceeds attendee expectations and establishes a benchmark for future events`,
      `Foster meaningful connections among ${audienceType.toLowerCase()} through structured networking opportunities, collaborative activities, and shared learning experiences`,
      `Generate measurable engagement and community growth by driving social media visibility, post-event feedback scores above 4.5/5, and a 30% increase in community sign-ups`,
    ],
    audience: `Primary audience consists of ${audienceType.toLowerCase()} with an expected turnout of ${audienceSize} attendees. The demographic is highly engaged, tech-savvy, and looking for actionable insights and genuine networking opportunities.`,
    executionGoals: [
      "Ensure seamless logistics with zero critical issues on event day — from registration flow to session transitions and venue management",
      "Achieve 80%+ attendee satisfaction through well-paced programming, quality content, and responsive on-ground support",
      "Build a reusable operational playbook and content library that can be leveraged for future events in the series",
    ],
  };

  const checklist: ChecklistItem[] = [
    {
      id: "chk-1",
      category: "Venue & Logistics",
      task: "Finalize venue booking and confirm capacity, AV setup, Wi-Fi bandwidth, and parking availability",
      priority: "high",
      completed: false,
      deadline: "6 weeks before event",
      owner: "Logistics Team",
    },
    {
      id: "chk-2",
      category: "Venue & Logistics",
      task: "Arrange catering with dietary options (vegetarian, vegan, gluten-free) and confirm delivery schedule",
      priority: "medium",
      completed: false,
      deadline: "4 weeks before event",
      owner: "Registration Lead",
    },
    {
      id: "chk-3",
      category: "Registration",
      task: "Set up online registration portal with ticketing tiers, confirmation emails, and QR code check-in",
      priority: "high",
      completed: false,
      deadline: "3 weeks before event",
      owner: "Program Team",
    },
    {
      id: "chk-4",
      category: "Registration",
      task: "Prepare attendee welcome kits including badges, event schedule, swag, and feedback QR cards",
      priority: "medium",
      completed: false,
      deadline: "2 weeks before event",
      owner: "Operations Lead",
    },
    {
      id: "chk-5",
      category: "Promotion",
      task: "Launch social media campaign across Instagram, LinkedIn, and Twitter with event countdown graphics",
      priority: "high",
      completed: false,
      deadline: "1 week before event",
      owner: "Tech Lead",
    },
    {
      id: "chk-6",
      category: "Promotion",
      task: "Send email invitations to mailing list and partner organizations with early-bird incentives",
      priority: "medium",
      completed: false,
      deadline: "1 week before event",
      owner: "Volunteer Coordinator",
    },
    {
      id: "chk-7",
      category: "Speakers & Content",
      task: "Confirm all speakers/panelists, collect bios, headshots, and presentation decks by deadline",
      priority: "high",
      completed: false,
      deadline: "3 days before event",
      owner: "Event Manager",
    },
    {
      id: "chk-8",
      category: "Speakers & Content",
      task: "Prepare session run-of-show document with timings, transitions, and backup plans for each segment",
      priority: "medium",
      completed: false,
      deadline: "1 day before event",
      owner: "Logistics Team",
    },
    {
      id: "chk-9",
      category: "Photography & Media",
      task: "Hire photographer and videographer, brief them on key moments to capture and brand guidelines",
      priority: "low",
      completed: false,
      deadline: "1 week before event",
      owner: "Media Team",
    },
    {
      id: "chk-10",
      category: "Attendee Management",
      task: "Set up on-site help desk, volunteer assignments, and emergency contact protocols",
      priority: "high",
      completed: false,
      deadline: "1 day after event",
      owner: "Event Manager",
    },
  ];

  const timeline: TimelinePhase[] = [
    {
      phase: "before",
      tasks: [
        {
          task: "Finalize venue contract, confirm speaker lineup, and lock in the event budget",
          timing: "4 weeks before",
        },
        {
          task: "Launch registration page and kick off promotional campaign across all channels",
          timing: "2 weeks before",
        },
        {
          task: "Send reminder emails to registered attendees with event agenda and logistics info",
          timing: "1 week before",
        },
        {
          task: "Conduct dry run of AV equipment, test check-in system, and finalize volunteer roles",
          timing: "3 days before",
        },
        {
          task: "Confirm final headcount with caterers, print materials, and prepare welcome kits",
          timing: "1 day before",
        },
      ],
    },
    {
      phase: "during",
      tasks: [
        {
          task: "Set up registration desk, signage, and AV — run final tech checks across all rooms",
          timing: "Morning",
        },
        {
          task: "Welcome attendees, deliver opening remarks, and set the tone for the day",
          timing: "Opening",
        },
        {
          task: "Monitor session flow, manage Q&A, and post live updates to social media",
          timing: "Mid-event",
        },
        {
          task: "Deliver closing remarks, distribute feedback forms, and facilitate networking wrap-up",
          timing: "Closing",
        },
      ],
    },
    {
      phase: "after",
      tasks: [
        {
          task: "Send thank-you messages to attendees, speakers, sponsors, and volunteers",
          timing: "Same day",
        },
        {
          task: "Compile photo/video highlights and share recap posts across social media",
          timing: "Within 3 days",
        },
        {
          task: "Analyze feedback data, prepare post-event report, and document lessons learned",
          timing: "Within 1 week",
        },
      ],
    },
  ];

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "the event date";

  const communication: CommunicationItem[] = [
    {
      type: "whatsapp",
      label: "WhatsApp Announcement",
      content: `🎉 *${title}* is here!\n\n📅 Date: ${formattedDate}\n👥 Open to: ${audienceType}\n🎯 Event Type: ${eventType}\n\nWe're putting together an incredible ${eventType.toLowerCase()} experience and you're invited! Expect insightful sessions, hands-on activities, and amazing networking opportunities.\n\n🔗 Register now — spots are limited to ${audienceSize} attendees!\n\nSpread the word and tag someone who should be there! 🚀`,
    },
    {
      type: "instagram",
      label: "Instagram Caption",
      content: `Something big is coming. 👀✨\n\nIntroducing *${title}* — a ${eventType.toLowerCase()} built for ${audienceType.toLowerCase()} who want more than just another event.\n\n📅 ${formattedDate}\n👥 ${audienceSize} spots only\n🔥 Packed with insights, energy, and real connections\n\nThis isn't just an event — it's an experience. Are you in?\n\nTag your crew. Drop a 🙌 if you're coming.\n\n#${title.replace(/\s+/g, "")} #${eventType.replace(/\s+/g, "")} #EventsWorthAttending #CommunityBuilding #Networking #Innovation`,
    },
    {
      type: "reminder",
      label: "Reminder Message",
      content: `Hey there! 👋\n\nJust a friendly reminder that *${title}* is right around the corner!\n\n📅 ${formattedDate}\n📍 Check your email for venue details\n\nHere's what to bring:\n✅ Your ID for check-in\n✅ A fully charged laptop (if applicable)\n✅ Your best energy and ideas!\n\nWe can't wait to see you there. If you have any questions, don't hesitate to reach out.\n\nSee you soon! 🎉`,
    },
    {
      type: "email",
      label: "Email Draft",
      content: `Subject: You're Invited to ${title} — ${formattedDate}\n\nDear [Name],\n\nWe are thrilled to invite you to ${title}, a premier ${eventType.toLowerCase()} designed exclusively for ${audienceType.toLowerCase()}.\n\nEvent Details:\n• Date: ${formattedDate}\n• Format: ${eventType}\n• Expected Attendance: ${audienceSize} participants\n\nWhat to Expect:\nThis event brings together thought leaders, practitioners, and enthusiasts for a day of learning, collaboration, and inspiration. You'll have the opportunity to engage with expert-led sessions, participate in interactive activities, and connect with like-minded individuals.\n\nWhy Attend?\n• Gain actionable insights from industry experts\n• Network with a curated community of ${audienceType.toLowerCase()}\n• Be part of an experience designed for impact\n\nSpaces are limited, so we encourage you to register at your earliest convenience.\n\nWe look forward to welcoming you.\n\nWarm regards,\nThe ${title} Organizing Team`,
    },
  ];

  const socialMedia: SocialMediaIdea[] = [
    {
      type: "reel",
      title: "Behind the Scenes Reel",
      description: `A fast-paced, 30-60 second reel showing the preparation journey for ${title}. Include clips of venue setup, team planning sessions, design mockups, and a sneak peek of swag or stage design. Use trending audio with a high-energy beat to build excitement.`,
      caption: `The magic happens before the curtain rises. 🎬✨\n\nHere's a sneak peek at what goes into making ${title} unforgettable.\n\n${formattedDate} — are you ready?\n\n#BehindTheScenes #${title.replace(/\s+/g, "")} #EventPrep #ComingSoon`,
    },
    {
      type: "story",
      title: "Countdown Story Series",
      description: `A 5-day Instagram/LinkedIn story series counting down to ${title}. Each day reveals a new element: Day 5 — Speaker reveal, Day 4 — Agenda preview, Day 3 — Venue sneak peek, Day 2 — Swag unboxing, Day 1 — Final hype video. Use interactive stickers (polls, countdowns, questions) to boost engagement.`,
      caption: `⏳ T-minus 5 days to ${title}!\n\nEvery day this week, we're dropping something new. Stay tuned to our stories — you won't want to miss what's coming.\n\nDay 5: 🎤 Speaker Reveal\n\n#Countdown #${title.replace(/\s+/g, "")} #StayTuned`,
    },
    {
      type: "teaser",
      title: "Teaser Campaign",
      description: `A cinematic 15-second teaser video with bold typography, glitch transitions, and a suspenseful soundtrack. Flash key phrases: "Something Big," "${eventType}," "${audienceSize}+ Attendees," "${formattedDate}," and end with the ${title} logo reveal. Optimized for Instagram Reels, TikTok, and LinkedIn.`,
      caption: `Something big is brewing. 🔥\n\n${title} is almost here — and it's going to redefine what a ${eventType.toLowerCase()} looks like.\n\nMark your calendar. Tell your friends. This is the one.\n\n📅 ${formattedDate}\n\n#${title.replace(/\s+/g, "")} #Teaser #BigAnnouncement #${eventType.replace(/\s+/g, "")}`,
    },
    {
      type: "countdown",
      title: "Final Countdown Post",
      description: `A high-impact carousel or single image post for the day before or morning of ${title}. Feature a bold "TOMORROW" or "TODAY" graphic with the event logo, key details (time, venue, what to bring), and a strong call-to-action. Use brand colors and clean typography for maximum visual punch.`,
      caption: `🚀 IT'S HAPPENING!\n\n${title} is TOMORROW and we couldn't be more excited!\n\nHere's your final checklist:\n✅ Registration confirmed\n✅ Calendar blocked\n✅ Squad notified\n✅ Energy levels: MAX\n\nSee you there, ${audienceType.toLowerCase()}! Let's make this one for the books. 📖🔥\n\n#${title.replace(/\s+/g, "")} #FinalCountdown #LetsGo #${eventType.replace(/\s+/g, "")}`,
    },
  ];

  return {
    brief,
    checklist,
    timeline,
    communication,
    socialMedia,
  };
}
