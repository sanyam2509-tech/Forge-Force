"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock3,
  Copy,
  MapPin,
  Plus,
  User,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { EventInput, GeneratedWorkspace } from "@/lib/types";

interface RunOfShowTabProps {
  workspace: GeneratedWorkspace;
  eventInput: EventInput;
}

interface RunSegment {
  id: string;
  time: string;
  segment: string;
  owner: string;
  location: string;
  notes: string;
  risk: string;
  backup: string;
}

function eventHas(input: EventInput, pattern: RegExp) {
  return pattern.test(`${input.eventType} ${input.title} ${input.eventGoal ?? ""}`);
}

function buildInitialRunOfShow(
  eventInput: EventInput,
  workspace: GeneratedWorkspace
): RunSegment[] {
  const isHackathon = eventHas(eventInput, /hackathon|demo|build/i);
  const isWorkshop = eventHas(eventInput, /workshop|training/i);

  const core = [
    {
      time: "T-90 min",
      segment: "Team arrival and command center open",
      owner: "Event Lead",
      location: "Main venue",
      notes: "Open command channel, confirm owner map, review escalation path.",
      risk: "Late setup discovery",
      backup: "Prioritize check-in, AV, signage, and support desk first.",
    },
    {
      time: "T-60 min",
      segment: "AV, Wi-Fi, signage, and check-in test",
      owner: "Operations Lead",
      location: "Registration + stage",
      notes: "Run QR test, microphone test, projector test, and Wi-Fi load check.",
      risk: "Technical setup failure",
      backup: "Move to backup hotspot, spare laptop, printed attendee list.",
    },
    {
      time: "T-30 min",
      segment: "Volunteer briefing",
      owner: "Volunteer Lead",
      location: "Registration desk",
      notes: "Confirm stations, scripts, breaks, emergency contact, and runner role.",
      risk: "Unclear responsibilities",
      backup: "Post station checklist in team chat.",
    },
    {
      time: "Doors open",
      segment: "Attendee check-in and welcome flow",
      owner: "Registration Lead",
      location: "Entrance",
      notes: "Keep queue moving, route issues to help desk, capture arrival content.",
      risk: "Queue congestion",
      backup: "Open manual check-in lane and split badge pickup.",
    },
    {
      time: "Opening",
      segment: "Host welcome and agenda orientation",
      owner: "Host",
      location: "Main stage",
      notes: workspace.brief.summary,
      risk: "Audience confusion",
      backup: "Show agenda slide and repeat support contact.",
    },
  ];

  const middle = isHackathon
    ? [
        {
          time: "Build block",
          segment: "Team formation, mentor routing, and build support",
          owner: "Program Lead",
          location: "Work area",
          notes: "Route teams to mentors, track blocked teams, monitor energy.",
          risk: "Teams stall early",
          backup: "Create rapid support queue for product, tech, and pitching.",
        },
        {
          time: "Demo prep",
          segment: "Final submissions and demo order freeze",
          owner: "Judging Lead",
          location: "Main stage",
          notes: "Lock demo order, test screen share, prepare judging rubric.",
          risk: "Demo chaos",
          backup: "Use fallback pitch timer and manual submission list.",
        },
      ]
    : isWorkshop
      ? [
          {
            time: "Hands-on block",
            segment: "Guided exercise and support routing",
            owner: "Facilitator",
            location: "Workshop room",
            notes: "Pause at checkpoints and route stuck attendees to support.",
            risk: "Participants fall behind",
            backup: "Use helper table and simplified exercise path.",
          },
          {
            time: "Share-out",
            segment: "Participant outcomes and Q&A",
            owner: "Host",
            location: "Workshop room",
            notes: "Collect wins, blockers, and follow-up questions.",
            risk: "Low engagement",
            backup: "Use prepared prompts and invite volunteers first.",
          },
        ]
      : [
          {
            time: "Main program",
            segment: "Session execution and live issue handling",
            owner: "Program Lead",
            location: "Main room",
            notes: "Monitor schedule drift, Q&A flow, and attendee support.",
            risk: "Schedule overrun",
            backup: "Trim Q&A and protect closing segment.",
          },
          {
            time: "Networking",
            segment: "Facilitated connections and content capture",
            owner: "Community Lead",
            location: "Common area",
            notes: "Prompt introductions, capture quotes, and sponsor visibility.",
            risk: "Energy drop",
            backup: "Start structured prompt or mini activity.",
          },
        ];

  const closing = [
    {
      time: "Closing",
      segment: "Wrap-up, CTA, feedback link, and sponsor mention",
      owner: "Host",
      location: "Main stage",
      notes: "Thank attendees, volunteers, speakers, sponsors. Share next step.",
      risk: "Weak follow-through",
      backup: "Put QR feedback and next CTA on final slide.",
    },
    {
      time: "T+30 min",
      segment: "Debrief and first recap asset",
      owner: "Event Lead",
      location: "Command channel",
      notes: "Log issues, collect photos, confirm thank-you message owner.",
      risk: "Post-event momentum lost",
      backup: "Send same-day thank-you using prepared copy.",
    },
  ];

  return [...core, ...middle, ...closing].map((item, index) => ({
    id: `run-${index + 1}`,
    ...item,
  }));
}

function formatRunOfShow(items: RunSegment[]) {
  return items
    .map((item) => {
      return `${item.time} - ${item.segment}
Owner: ${item.owner}
Location: ${item.location}
Notes: ${item.notes}
Risk: ${item.risk}
Backup: ${item.backup}`;
    })
    .join("\n\n---\n\n");
}

export function RunOfShowTab({ workspace, eventInput }: RunOfShowTabProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const initial = useMemo(
    () => buildInitialRunOfShow(eventInput, workspace),
    [eventInput, workspace]
  );
  const [segments, setSegments] = useState<RunSegment[]>(initial);
  const [newSegment, setNewSegment] = useState("");

  const addSegment = () => {
    if (!newSegment.trim()) return;
    setSegments((prev) => [
      ...prev,
      {
        id: `run-custom-${Date.now()}`,
        time: "Custom",
        segment: newSegment.trim(),
        owner: "Event Lead",
        location: "TBD",
        notes: "Added manually during planning.",
        risk: "Unscoped operational dependency",
        backup: "Assign owner and confirm timing before event day.",
      },
    ]);
    setNewSegment("");
  };

  const updateSegment = (
    id: string,
    field: keyof Omit<RunSegment, "id">,
    value: string
  ) => {
    setSegments((prev) =>
      prev.map((segment) =>
        segment.id === id ? { ...segment, [field]: value } : segment
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Clock3 className="size-5 text-primary" />
          Event-Day Run of Show
        </CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copy(formatRunOfShow(segments), "run-of-show")}
          >
            {isCopied("run-of-show") ? (
              <Check className="mr-1 size-3.5" />
            ) : (
              <Copy className="mr-1 size-3.5" />
            )}
            Copy Run Sheet
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            placeholder="Add run-of-show segment"
            value={newSegment}
            onChange={(event) => setNewSegment(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addSegment();
            }}
          />
          <Button onClick={addSegment} disabled={!newSegment.trim()}>
            <Plus className="mr-2 size-3.5" />
            Add Segment
          </Button>
        </div>

        <div className="space-y-3">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="rounded-xl border border-border/60 bg-secondary/30 p-4"
            >
              <div className="grid gap-3 lg:grid-cols-[110px_1fr_180px_160px]">
                <Input
                  value={segment.time}
                  onChange={(event) =>
                    updateSegment(segment.id, "time", event.target.value)
                  }
                  className="font-medium text-primary"
                />
                <Input
                  value={segment.segment}
                  onChange={(event) =>
                    updateSegment(segment.id, "segment", event.target.value)
                  }
                  className="font-semibold"
                />
                <Input
                  value={segment.owner}
                  onChange={(event) =>
                    updateSegment(segment.id, "owner", event.target.value)
                  }
                />
                <Input
                  value={segment.location}
                  onChange={(event) =>
                    updateSegment(segment.id, "location", event.target.value)
                  }
                />
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-3">
                <Textarea
                  value={segment.notes}
                  onChange={(event) =>
                    updateSegment(segment.id, "notes", event.target.value)
                  }
                  className="min-h-20"
                />
                <Textarea
                  value={segment.risk}
                  onChange={(event) =>
                    updateSegment(segment.id, "risk", event.target.value)
                  }
                  className="min-h-20"
                />
                <Textarea
                  value={segment.backup}
                  onChange={(event) =>
                    updateSegment(segment.id, "backup", event.target.value)
                  }
                  className="min-h-20"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <User className="size-3" />
                  {segment.owner}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="size-3" />
                  {segment.location}
                </Badge>
                <Badge variant="outline" className="gap-1 border-yellow-500/30 text-yellow-300">
                  <AlertTriangle className="size-3" />
                  Backup defined
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
