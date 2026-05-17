export interface EventInput {
  title: string;
  eventType: string;
  audienceType: string;
  audienceSize: string;
  eventDate: string;
  mainStartDate?: string;
  mainEndDate?: string;
  startTime?: string;
  endTime?: string;
  eventGoal?: string;
  tone?: string;
  additionalNotes?: string;
  volunteerNames?: string;
  subEvents?: SubEvent[];
  venue?: string;
  budget?: string;
  goals?: string;
  additionalContext?: string;
}

export interface SuggestedAsset {
  id: string;
  name: string;
  purpose: string;
  requiredFields: string[];
  priority: "High" | "Medium" | "Low";
  neededBy: string;
}

export interface PRTask {
  id: string;
  title: string;
  channel: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  owner: string;
  status: "Todo" | "In Progress" | "Done";
}

export interface EventDocument {
  id: string;
  name: string;
  scope: "Parent" | "Sub-Event";
  subEventId?: string;
  purpose: string;
  content: string;
  priority: "High" | "Medium" | "Low";
  ready: boolean;
}

export interface SubEvent {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  expectedAudience: string;
  actualRegistrations?: string;
  description: string;
  roundNumber?: string;
  location: string;
  coordinatorName?: string;
  coordinatorContact?: string;
  requiredVolunteers?: string;
  volunteerNames?: string;
  status?: "Planning" | "Registration Open" | "Ready" | "Live" | "Completed" | "At Risk";
  prTasks?: PRTask[];
  assets?: SuggestedAsset[];
  documents?: EventDocument[];
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
  dueDate?: string;    // ISO date e.g. "2026-06-18"
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
