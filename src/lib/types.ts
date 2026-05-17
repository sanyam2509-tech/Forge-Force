export interface EventInput {
  title: string;
  eventType: string;
  audienceType: string;
  audienceSize: string;
  eventDate: string;
  eventGoal: string;
  tone: string;
  additionalNotes: string;
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
