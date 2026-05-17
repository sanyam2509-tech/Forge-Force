"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Check,
  ClipboardList,
  Clock3,
  Copy,
  Megaphone,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { collectSuggestedAssets, validateSchedule } from "@/lib/schedule";
import type {
  ChecklistItem,
  CommunicationItem,
  EventInput,
  GeneratedWorkspace,
  SocialMediaIdea,
  TimelinePhase,
} from "@/lib/types";

interface CommandCenterTabProps {
  workspace: GeneratedWorkspace;
  eventInput: EventInput;
}

const rolePlans: Record<string, string[]> = {
  hackathon: [
    "Registration Desk",
    "Technical Support",
    "Mentor Coordination",
    "Food Logistics",
    "Social Media Coverage",
    "Final Demo Support",
    "Judging Coordination",
    "Venue Runner",
  ],
  workshop: [
    "Check-in Desk",
    "Speaker Support",
    "AV Setup",
    "Material Distribution",
    "Attendee Support",
    "Photography",
    "Feedback Collection",
    "Room Runner",
  ],
  conference: [
    "Registration",
    "Session Manager",
    "Speaker Escort",
    "Information Desk",
    "Media Capture",
    "Sponsor Support",
    "Crowd Flow",
    "Stage Runner",
  ],
};

const fallbackRoles = [
  "Operations Lead",
  "Registration",
  "Guest Support",
  "Logistics",
  "Media Capture",
  "Social Media",
  "Technical Support",
  "Runner",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDaysUntil(eventDate: string) {
  const date = new Date(`${eventDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 30;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
}

function getUrgency(daysUntil: number) {
  if (daysUntil <= 3) return "critical";
  if (daysUntil <= 14) return "sprint";
  if (daysUntil <= 60) return "planned";
  return "strategic";
}

function getHealthLabel(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Stable";
  if (score >= 50) return "At Risk";
  return "Critical";
}

function getHealthStyle(score: number) {
  if (score >= 85) return "border-green-500/30 text-green-400 bg-green-500/10";
  if (score >= 70) return "border-cyan-500/30 text-cyan-300 bg-cyan-500/10";
  if (score >= 50) return "border-yellow-500/30 text-yellow-300 bg-yellow-500/10";
  return "border-red-500/30 text-red-300 bg-red-500/10";
}

function eventHas(input: EventInput, pattern: RegExp) {
  return pattern.test(`${input.eventType} ${input.title} ${input.eventGoal ?? ""}`);
}

function getVolunteerCount(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return 0;

  const asNumber = Number(trimmed);
  if (Number.isInteger(asNumber) && asNumber > 0) return asNumber;

  return trimmed
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean).length;
}

function getVolunteerNames(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return [];

  const asNumber = Number(trimmed);
  if (Number.isInteger(asNumber) && asNumber > 0) {
    return Array.from({ length: Math.min(asNumber, 40) }, (_, index) => {
      return `Volunteer ${index + 1}`;
    });
  }

  return trimmed
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 40);
}

function formatList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function formatTasks(tasks: ChecklistItem[]) {
  return tasks
    .map((task) => {
      const owner = task.owner ? ` | Owner: ${task.owner}` : "";
      const deadline = task.deadline ? ` | Due: ${task.deadline}` : "";
      return `- [${task.completed ? "x" : " "}] ${task.task} (${task.priority})${owner}${deadline}`;
    })
    .join("\n");
}

function formatTimeline(timeline: TimelinePhase[]) {
  return timeline
    .map((phase) => {
      const items = phase.tasks
        .map((item) => `- ${item.timing}: ${item.task}`)
        .join("\n");
      return `${phase.phase.toUpperCase()}\n${items}`;
    })
    .join("\n\n");
}

function formatCommunication(items: CommunicationItem[]) {
  return items
    .map((item) => `${item.label}\n${item.content}`)
    .join("\n\n---\n\n");
}

function formatSocial(items: SocialMediaIdea[]) {
  return items
    .map((item) => {
      return `${item.title}\nType: ${item.type}\n${item.description}\n\nCaption:\n${item.caption}`;
    })
    .join("\n\n---\n\n");
}

function getRolePlan(eventType: string, volunteerNames: string[]) {
  const roles = rolePlans[eventType.toLowerCase()] ?? fallbackRoles;
  return volunteerNames.map((name, index) => ({
    name,
    role: roles[index % roles.length],
  }));
}

function buildScripts(eventInput: EventInput, workspace: GeneratedWorkspace) {
  const title = eventInput.title;
  const audience = eventInput.audienceType.toLowerCase();
  const goal = eventInput.eventGoal || workspace.brief.objectives[0];
  const firstObjective = workspace.brief.objectives[0];

  return {
    pitch: `${title} is an AI-planned ${eventInput.eventType.toLowerCase()} for ${eventInput.audienceSize} ${audience}. In seconds, EventOS turns a loose idea into an execution-ready workspace: tasks, timeline, comms, social content, volunteer roles, reminders, risks, and scripts. The goal is simple: ${goal}`,
    opening: `Good morning everyone, and welcome to ${title}. Today is designed for energy, clarity, and momentum. We will keep the flow tight, make support easy to find, and help every participant leave with something real. Our operating goal: ${firstObjective}`,
    closing: `That is a wrap on ${title}. Thank you to every attendee, volunteer, mentor, speaker, and sponsor who helped make this run smoothly. Please share feedback, tag us in your highlights, and watch for the recap and next steps after the event.`,
    recap: `${title} brought together ${eventInput.audienceSize} ${audience} for a focused ${eventInput.eventType.toLowerCase()} built around ${goal}. The team delivered the program, managed attendee flow, supported communications, and captured content for post-event momentum.`,
    sponsor: `A special thank you to our sponsors and partners for supporting ${title}. Your support helped create a smoother attendee experience, stronger operations, and more room for participants to focus on building, learning, and connecting.`,
  };
}

export function CommandCenterTab({
  workspace,
  eventInput,
}: CommandCenterTabProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const volunteerNames = getVolunteerNames(eventInput.volunteerNames);
  const volunteerCount = getVolunteerCount(eventInput.volunteerNames);
  const rolePlan = getRolePlan(eventInput.eventType, volunteerNames);
  const scripts = buildScripts(eventInput, workspace);
  const daysUntil = getDaysUntil(eventInput.eventDate);
  const urgency = getUrgency(daysUntil);
  const scheduleWarnings = validateSchedule(eventInput);
  const suggestedAssets = collectSuggestedAssets(eventInput);
  const subEvents = eventInput.subEvents ?? [];

  const totalTasks = workspace.checklist.length;
  const completedTasks = workspace.checklist.filter((task) => task.completed).length;
  const highPriorityTasks = workspace.checklist.filter(
    (task) => task.priority === "high" && !task.completed
  );
  const taskReadiness = totalTasks ? completedTasks / totalTasks : 0;
  const communicationReadiness = clamp(workspace.communication.length / 4, 0, 1);
  const socialReadiness = clamp(workspace.socialMedia.length / 4, 0, 1);
  const volunteerReadiness = clamp(volunteerCount / 8, 0, 1);
  const timelineReadiness = clamp(workspace.timeline.length / 3, 0, 1);
  const operationalCompleteness = clamp(
    (workspace.brief.objectives.length +
      workspace.brief.executionGoals.length +
      totalTasks +
      workspace.timeline.reduce((sum, phase) => sum + phase.tasks.length, 0)) /
      28,
    0,
    1
  );
  const score = Math.round(
    (taskReadiness * 0.35 +
      communicationReadiness * 0.2 +
      socialReadiness * 0.2 +
      volunteerReadiness * 0.15 +
      timelineReadiness * 0.05 +
      operationalCompleteness * 0.05) *
      100
  );
  const healthLabel = getHealthLabel(score);
  const attendeeCount = Number(eventInput.audienceSize) || 0;
  const attendeeVolunteerRatio =
    volunteerCount > 0 && attendeeCount > 0
      ? Math.round(attendeeCount / volunteerCount)
      : null;
  const recommendedVolunteers = Math.max(3, Math.ceil(attendeeCount / 35));
  const volunteerGap = Math.max(0, recommendedVolunteers - volunteerCount);

  const metrics = [
    {
      label: "Timeline readiness",
      value: Math.round(timelineReadiness * 100),
      detail:
        urgency === "critical"
          ? "Final 72-hour execution mode"
          : `${daysUntil <= 0 ? "Event window" : `${daysUntil} days`} until event`,
      icon: Clock3,
    },
    {
      label: "Task execution",
      value: Math.round(taskReadiness * 100),
      detail: `${completedTasks}/${totalTasks} tasks complete`,
      icon: ClipboardList,
    },
    {
      label: "Volunteer coverage",
      value: Math.round(volunteerReadiness * 100),
      detail:
        volunteerCount > 0
          ? `${attendeeVolunteerRatio ?? "-"} attendees per volunteer`
          : "No volunteer capacity entered",
      icon: Users,
    },
    {
      label: "Comms readiness",
      value: Math.round(communicationReadiness * 100),
      detail: `${workspace.communication.length} core messages ready`,
      icon: Radio,
    },
    {
      label: "Promotion quality",
      value: Math.round(socialReadiness * 100),
      detail: `${workspace.socialMedia.length} campaign assets ready`,
      icon: Megaphone,
    },
    {
      label: "Ops completeness",
      value: Math.round(operationalCompleteness * 100),
      detail: "Brief, timeline, tasks, and goals covered",
      icon: ShieldCheck,
    },
  ];

  const riskObjects = [
    ...(highPriorityTasks.length > 0
      ? [
          {
            title: "Critical tasks still open",
            detail: `${highPriorityTasks.length} high-priority task${highPriorityTasks.length !== 1 ? "s" : ""} need completion or owner confirmation.`,
            severity: "high",
          },
        ]
      : []),
    ...(volunteerGap > 0
      ? [
          {
            title: "Volunteer coverage below recommended load",
            detail: `Recommended ${recommendedVolunteers} volunteers for ${eventInput.audienceSize} attendees. Add ${volunteerGap} backup volunteer${volunteerGap !== 1 ? "s" : ""}.`,
            severity: volunteerGap >= 3 ? "high" : "medium",
          },
        ]
      : []),
    ...(attendeeVolunteerRatio && attendeeVolunteerRatio > 45
      ? [
          {
            title: "High attendee-to-volunteer ratio",
            detail: `${attendeeVolunteerRatio}:1 load may slow check-in, help desk, and issue routing.`,
            severity: "high",
          },
        ]
      : []),
    ...(workspace.communication.length < 4
      ? [
          {
            title: "Communication frequency insufficient",
            detail: "Announcement, email, reminder, and day-before copy should all be ready before launch.",
            severity: "medium",
          },
        ]
      : []),
    ...(workspace.socialMedia.length < 4 || (urgency !== "strategic" && daysUntil <= 14)
      ? [
          {
            title: "Promotion pressure detected",
            detail:
              daysUntil <= 14
                ? "Event is close. Social proof, reminders, and direct CTAs should be active now."
                : "Promotion plan needs launch, countdown, reel hooks, and audience engagement assets.",
            severity: daysUntil <= 7 ? "high" : "medium",
          },
        ]
      : []),
    ...(eventHas(eventInput, /hackathon|workshop|conference|demo|tech/i) &&
    !workspace.checklist.some((task) => /technical|av|wi-fi|wifi|equipment/i.test(task.task))
      ? [
          {
            title: "Technical backup not explicit",
            detail: "Add a named owner for AV, Wi-Fi, chargers, demos, and technical escalation.",
            severity: "medium",
          },
        ]
      : []),
    ...(urgency === "critical"
      ? [
          {
            title: "Final-window execution risk",
            detail: "Inside 72 hours, new scope should be rejected unless it directly reduces event-day risk.",
            severity: "high",
          },
        ]
      : []),
    ...(scheduleWarnings.length > 0
      ? [
          {
            title: "Schedule validation warning",
            detail: scheduleWarnings[0],
            severity: "high",
          },
        ]
      : []),
    ...(subEvents.length > 0 && suggestedAssets.length === 0
      ? [
          {
            title: "Submission and feedback flow missing",
            detail: "Sub-events exist, but no required forms/assets were detected.",
            severity: "medium",
          },
        ]
      : []),
    ...(subEvents.some((event) => Number(event.requiredVolunteers || 0) <= 0)
      ? [
          {
            title: "Critical round volunteer ownership missing",
            detail: "At least one sub-event does not define required volunteer coverage.",
            severity: "medium",
          },
        ]
      : []),
  ];
  const risks = riskObjects.map((risk) => risk.detail);

  const recommendations =
    urgency === "critical"
      ? [
          "Freeze the run-of-show and reject new scope unless it removes risk.",
          "Run a 15-minute volunteer briefing with exact posts and escalation owner.",
          "Send the final attendee reminder with arrival time, location, and support contact.",
          "Assign one person to live schedule drift and one person to attendee issues.",
          "Stage closing script, feedback link, and first recap post before doors open.",
        ]
      : urgency === "sprint"
        ? [
            "Convert the task list into owners for logistics, comms, volunteers, program, and media.",
            "Schedule a final promotion push with social proof and direct registration CTA.",
            "Confirm vendors, speakers, volunteer availability, AV, and check-in flow this week.",
            "Prepare a day-before reminder and a morning-of WhatsApp message.",
            "Assign content capture moments before the event gets chaotic.",
          ]
        : urgency === "planned"
          ? [
              "Build a weekly marketing rhythm with proof drops, speaker reveals, and partner posts.",
              "Secure program owners and volunteer leads before registration momentum grows.",
              "Confirm venue, AV, food, and sponsor requirements while there is still negotiating room.",
              "Create attendee prep copy now so reminders are not written in panic mode.",
              "Define success metrics: registrations, attendance rate, NPS, content assets, and follow-ups.",
            ]
          : [
              "Use the extra runway for sponsor outreach, venue options, and partner distribution.",
              "Define the event thesis and what attendees will concretely leave with.",
              "Create a launch calendar with content pillars, community partners, and conversion targets.",
              "Build the speaker or mentor pipeline before public launch.",
              "Set decision deadlines now so planning does not quietly become vibes management.",
            ];

  const lastMinuteChecklist =
    urgency === "critical"
      ? [
          "Confirm venue access, AV, Wi-Fi, signage, check-in, and emergency contact.",
          "Brief volunteers on roles, escalation path, and exact station locations.",
          "Send final attendee reminder with timing, location, agenda, and what to bring.",
          "Stage social posts, sponsor mention, feedback link, and recap copy.",
          "Open command channel and assign one person to schedule drift.",
        ]
      : [
          "Confirm venue access, AV, Wi-Fi, and registration desk setup.",
          "Brief volunteers on roles, escalation path, and emergency contact.",
          "Send final attendee reminder with timing, location, and what to bring.",
          "Stage social posts, sponsor mentions, and post-event recap copy.",
          "Keep closing script and feedback link ready before final demos.",
        ];

  const nextActions = [
    ...(highPriorityTasks[0]
      ? [`Assign or complete: ${highPriorityTasks[0].task}`]
      : []),
    ...(volunteerGap > 0
      ? [`Add ${volunteerGap} backup volunteer${volunteerGap !== 1 ? "s" : ""} or reduce volunteer scope.`]
      : []),
    ...(urgency === "critical"
      ? ["Send final attendee reminder today with timing, location, support contact, and what to bring."]
      : urgency === "sprint"
        ? ["Schedule reminder email and social proof push within 24 hours."]
        : urgency === "planned"
          ? ["Confirm partner/speaker proof points for the next promotion cycle."]
          : ["Begin sponsor and venue outreach before public launch."]
    ),
    ...(workspace.socialMedia.length >= 4
      ? ["Choose one content owner for live stories, attendee quotes, and recap assets."]
      : ["Add campaign assets for launch, countdown, reel hook, and interactive story."]
    ),
  ].slice(0, 5);

  const operationalFeed = [
    {
      title: "Event health model refreshed",
      detail: `${healthLabel} state calculated from timeline, tasks, coverage, communications, and promotion signals.`,
      tone: "neutral",
    },
    {
      title:
        urgency === "critical"
          ? "Final-window mode active"
          : urgency === "sprint"
            ? "Execution sprint detected"
            : urgency === "planned"
              ? "Planned buildout window detected"
              : "Strategic runway detected",
      detail:
        urgency === "critical"
          ? "Focus on confirmation, reminders, volunteers, and run-of-show. Avoid adding new program scope."
          : urgency === "sprint"
            ? "Promotion, volunteer assignment, vendor checks, and attendee reminders should be active now."
            : urgency === "planned"
              ? "This is the right window for registration growth, speaker readiness, and sponsor visibility."
              : "Use the runway for venue strategy, sponsor outreach, partner distribution, and launch assets.",
      tone: urgency === "critical" ? "alert" : "neutral",
    },
    {
      title:
        volunteerGap > 0
          ? "Volunteer load imbalance detected"
          : "Volunteer coverage within operating range",
      detail:
        volunteerGap > 0
          ? `Coverage is short by ${volunteerGap}. Check-in, attendee support, and runner roles are most exposed.`
          : `${volunteerCount} volunteer${volunteerCount !== 1 ? "s" : ""} can cover the current operating plan.`,
      tone: volunteerGap > 0 ? "alert" : "good",
    },
    {
      title: "Promotion quality scan complete",
      detail:
        socialReadiness >= 1
          ? "Launch, countdown, reel, and interactive story concepts are ready for campaign execution."
          : "Promotion plan needs more conversion assets before it can reliably drive turnout.",
      tone: socialReadiness >= 1 ? "good" : "alert",
    },
    {
      title: "Communication cadence recommendation",
      detail:
        daysUntil <= 2
          ? "Send final reminder today and keep a short WhatsApp update ready for event morning."
          : daysUntil <= 14
            ? "Schedule day-before reminder now, then send a practical what-to-bring message."
            : "Prepare launch, confirmation, reminder, and final logistics messages before registration spikes.",
      tone: "neutral",
    },
    ...(subEvents.length > 0
      ? [
          {
            title: "Multi-stage schedule detected",
            detail: `${subEvents.length} sub-event${subEvents.length !== 1 ? "s" : ""} will be tracked for forms, volunteers, and operational dependencies.`,
            tone: "good",
          },
        ]
      : []),
  ];

  const exports = {
    full: `EVENT PLAN: ${eventInput.title}\n\nBRIEF\n${workspace.brief.summary}\n\nOBJECTIVES\n${formatList(workspace.brief.objectives)}\n\nTASKS\n${formatTasks(workspace.checklist)}\n\nTIMELINE\n${formatTimeline(workspace.timeline)}\n\nCOMMUNICATION\n${formatCommunication(workspace.communication)}\n\nSOCIAL\n${formatSocial(workspace.socialMedia)}`,
    volunteers:
      rolePlan.length > 0
        ? `VOLUNTEER PLAN\n${rolePlan
            .map((item) => `- ${item.name}: ${item.role}`)
            .join("\n")}`
        : "VOLUNTEER PLAN\nNo volunteers entered yet. Add volunteer names or a count in the create form.",
    communication: `COMMUNICATION KIT\n${formatCommunication(workspace.communication)}`,
    social: `SOCIAL MEDIA KIT\n${formatSocial(workspace.socialMedia)}`,
    scripts: `EVENT SCRIPTS\n\n30-Second Pitch\n${scripts.pitch}\n\nOpening Host Script\n${scripts.opening}\n\nClosing Script\n${scripts.closing}\n\nPost-Event Recap\n${scripts.recap}\n\nSponsor Mention\n${scripts.sponsor}`,
  };

  const scriptCards = [
    ["30-Second Pitch", scripts.pitch, "pitch"],
    ["Opening Host Script", scripts.opening, "opening"],
    ["Closing Script", scripts.closing, "closing"],
    ["Post-Event Recap", scripts.recap, "recap"],
    ["Sponsor Mention Script", scripts.sponsor, "sponsor"],
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.35fr_0.95fr]">
        <div className="space-y-5">
          <Card className="border-primary/25 bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Activity className="size-5 text-primary" />
                Event Health
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className={getHealthStyle(score)}>
                  {healthLabel}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/15 via-secondary/40 to-fuchsia-500/10 p-5">
                <p className="text-sm text-muted-foreground">
                  AI Event Health Score
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-6xl font-bold tracking-tight">{score}</span>
                  <span className="pb-2 text-sm text-muted-foreground">/ 100</span>
                </div>
                <Progress value={score} className="mt-5" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {daysUntil <= 0 ? "Event window" : `${daysUntil} days out`}
                  </Badge>
                  <Badge variant="secondary">{urgency} mode</Badge>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {metrics.slice(0, 3).map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.label}
                      className="rounded-lg border border-border/50 bg-secondary/30 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 text-primary" />
                          <span className="text-sm font-medium">{metric.label}</span>
                        </div>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {metric.value}%
                        </span>
                      </div>
                      <Progress value={metric.value} className="mt-2" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        {metric.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="size-5 text-yellow-400" />
                Operational Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskObjects.length > 0 ? (
                  riskObjects.slice(0, 5).map((risk) => (
                    <div
                      key={risk.title}
                      className="rounded-lg border border-border/50 bg-secondary/30 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{risk.title}</p>
                        <Badge
                          variant="outline"
                          className={
                            risk.severity === "high"
                              ? "border-red-500/30 text-red-300"
                              : "border-yellow-500/30 text-yellow-300"
                          }
                        >
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {risk.detail}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
                    No major risks detected. Keep monitoring task completion and communication cadence.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Zap className="size-5 text-primary" />
                AI Operational Feed
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  live model
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {operationalFeed.map((item, index) => (
                  <div
                    key={item.title}
                    className="relative rounded-lg border border-border/50 bg-secondary/30 p-4"
                  >
                    <div className="absolute left-4 top-5 size-2 rounded-full bg-primary shadow-[0_0_20px_oklch(0.72_0.16_190)]" />
                    <div className="pl-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <span className="text-xs text-muted-foreground">
                          T+{index + 1}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Target className="size-5 text-primary" />
                Recommended Next Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nextActions.map((action, index) => (
                  <div
                    key={action}
                    className="flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed">{action}</p>
                    <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Readiness Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {metrics.slice(3).map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.label}
                      className="rounded-lg border border-border/50 bg-secondary/30 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 text-primary" />
                          <span className="text-sm font-medium">{metric.label}</span>
                        </div>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {metric.value}%
                        </span>
                      </div>
                      <Progress value={metric.value} className="mt-2" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        {metric.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <ClipboardList className="size-5 text-primary" />
                Task Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {highPriorityTasks.length > 0 ? (
                <ul className="space-y-2">
                  {highPriorityTasks.slice(0, 5).map((task) => (
                    <li
                      key={task.id}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm leading-relaxed"
                    >
                      <span className="font-semibold text-red-300">High</span>{" "}
                      {task.task}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
                  No open high-priority tasks detected.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="size-5 text-primary" />
              AI Pitch and Recap Generator
            </CardTitle>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(exports.scripts, "scripts-all")}
              >
                {isCopied("scripts-all") ? (
                  <Check className="mr-1 size-3.5" />
                ) : (
                  <Copy className="mr-1 size-3.5" />
                )}
                Copy Scripts
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scriptCards.map(([title, body, key]) => (
                <div
                  key={key}
                  className="rounded-lg border border-border/50 bg-secondary/35 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold">{title}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copy(body, key)}
                    >
                      {isCopied(key) ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold">What is missing</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {risks.length > 0
                      ? risks[0]
                      : "The core workspace has the expected tasks, copy, timeline, and content plan."}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">What to do next</p>
                  <ul className="mt-2 space-y-2">
                    {recommendations.slice(0, 4).map((item) => (
                      <li key={item} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold">Last-minute checklist</p>
                  <ul className="mt-2 space-y-2">
                    {lastMinuteChecklist.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Export Pack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  ["Full Event Plan", exports.full, "export-full"],
                  ["Volunteer Plan", exports.volunteers, "export-volunteers"],
                  ["Communication Kit", exports.communication, "export-communication"],
                  ["Social Media Kit", exports.social, "export-social"],
                  ["Scripts", exports.scripts, "export-scripts"],
                ].map(([label, text, key]) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="justify-start"
                    onClick={() => copy(text, key)}
                  >
                    {isCopied(key) ? (
                      <Check className="mr-2 size-3.5" />
                    ) : (
                      <Copy className="mr-2 size-3.5" />
                    )}
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
