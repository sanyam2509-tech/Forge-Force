export interface EventInput {
  title: string;
  eventType: string;
  audienceType: string;
  audienceSize: string;
  eventDate: string;
  eventGoal?: string;
  tone?: string;
  additionalNotes?: string;
  venue?: string;
  budget?: string;
  goals?: string;
  additionalContext?: string;
}

export interface EventBrief {
  summary: string;
  objectives: string[];
  audience: string;
  executionGoals: string[];
}

export interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  deadline?: string;   // e.g. "3 days before event"
  owner?: string;      // e.g. "Event Manager"
}

export interface TimelinePhase {
  phase: "before" | "during" | "after";
  tasks: { task: string; timing: string }[];
}

export interface CommunicationItem {
  type: "whatsapp" | "instagram" | "reminder" | "email";
  label: string;
  content: string;
}

export interface SocialMediaIdea {
  type: "reel" | "story" | "teaser" | "countdown";
  title: string;
  description: string;
  caption: string;
}

export interface GeneratedWorkspace {
  brief: EventBrief;
  checklist: ChecklistItem[];
  timeline: TimelinePhase[];
  communication: CommunicationItem[];
  socialMedia: SocialMediaIdea[];
}

export interface Volunteer {
  id: string;
  name: string;
  skills: string;       // free-text, comma-separated e.g. "photography, social media"
  availability: string; // e.g. "Full day", "Morning only"
}

export interface VolunteerAssignment {
  volunteerId: string;
  volunteerName: string;
  role: string;
  category: "Core Operations" | "Guest Experience" | "Technical" | "Media & Content" | "Logistics";
  priority: "high" | "medium" | "low";
  estimatedEffort: string;
  status: "assigned" | "confirmed";
}

export interface Participant {
  id: string;
  name: string;
  email: string;
}

export interface EmailSendResult {
  participantId: string;
  email: string;
  status: "sent" | "failed" | "demo";
  error?: string;
}

export interface ReminderItem {
  id: string;
  type: "pre-event" | "day-before" | "day-of" | "post-event";
  label: string;
  subject: string;
  body: string;
  scheduledTiming: string;
  status: "pending" | "sent" | "demo" | "partial" | "failed";
  sentCount: number;
  demoCount: number;
  failedCount: number;
  results: EmailSendResult[];
}
