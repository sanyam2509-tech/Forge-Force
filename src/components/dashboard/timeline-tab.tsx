"use client";

import { Calendar, Clock, CheckCircle, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { EventInput, TimelinePhase } from "@/lib/types";

interface TimelineTabProps {
  timeline: TimelinePhase[];
  eventInput: EventInput;
  onRegenerate: () => void;
}

const phaseConfig: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  before: { label: "Before Event", icon: Calendar },
  during: { label: "During Event", icon: Clock },
  after: { label: "After Event", icon: CheckCircle },
};

function formatAbsoluteDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function deriveTimelineDate(timing: string, eventDate: string) {
  const event = new Date(`${eventDate}T12:00:00`);
  if (Number.isNaN(event.getTime())) return "";
  const lower = timing.toLowerCase();
  const weekMatch = lower.match(/(\d+)\s*weeks?\s*before/);
  const dayMatch = lower.match(/(\d+)\s*days?\s*before/);
  const hourMatch = lower.match(/(\d+)\s*hours?\s*before/);

  if (weekMatch) event.setDate(event.getDate() - Number(weekMatch[1]) * 7);
  else if (dayMatch) event.setDate(event.getDate() - Number(dayMatch[1]));
  else if (hourMatch) event.setDate(event.getDate() - 1);
  else if (lower.includes("day before")) event.setDate(event.getDate() - 1);
  else if (lower.includes("within 48 hours")) event.setDate(event.getDate() + 2);
  else if (lower.includes("within 1 week")) event.setDate(event.getDate() + 7);
  else if (lower.includes("same day") || lower.includes("event morning") || lower.includes("doors open") || lower.includes("closing")) {
    // keep event date
  } else if (lower.includes("today") || lower.includes("now") || lower.includes("next")) {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return formatAbsoluteDate(today.toISOString().slice(0, 10));
  } else {
    return "";
  }

  return formatAbsoluteDate(event.toISOString().slice(0, 10));
}

export function TimelineTab({ timeline, eventInput, onRegenerate }: TimelineTabProps) {
  const { isCopied, copy } = useCopyToClipboard();

  const formatAllAsText = () => {
    return timeline
      .map((phase) => {
        const config = phaseConfig[phase.phase];
        const header = config?.label ?? phase.phase;
        const tasks = phase.tasks
          .map((t) => {
            const date = deriveTimelineDate(t.timing, eventInput.eventDate);
            return `  [${date ? `${date} · ` : ""}${t.timing}] ${t.task}`;
          })
          .join("\n");
        return `${header}\n${tasks}`;
      })
      .join("\n\n");
  };

  const formatPhaseAsText = (phase: TimelinePhase) => {
    const config = phaseConfig[phase.phase];
    const header = config?.label ?? phase.phase;
    return `${header}\n${phase.tasks.map((t) => {
      const date = deriveTimelineDate(t.timing, eventInput.eventDate);
      return `  [${date ? `${date} · ` : ""}${t.timing}] ${t.task}`;
    }).join("\n")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Event Timeline</CardTitle>
        <CardAction>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copy(formatAllAsText(), "all")}
            >
              {isCopied("all") ? (
                <>
                  <Check className="size-3.5 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-3.5 mr-1" />
                  Copy All
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onRegenerate}>
              <RefreshCw className="size-3.5 mr-1" />
              Regenerate All
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {timeline.map((phase) => {
            const config = phaseConfig[phase.phase];
            if (!config) return null;
            const Icon = config.icon;

            return (
              <div key={phase.phase}>
                {/* Phase heading */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="size-5 text-primary" />
                    <h3 className="text-lg font-semibold">{config.label}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(formatPhaseAsText(phase), phase.phase)}
                  >
                    {isCopied(phase.phase) ? (
                      <>
                        <Check className="size-3.5 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                {/* Vertical timeline */}
                <div className="relative ml-2.5 pl-6">
                  {/* Vertical line */}
                  <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-border" />

                  <div className="space-y-4">
                    {phase.tasks.map((task, index) => (
                      <div key={index} className="relative">
                        {/* Dot */}
                        <div className="absolute -left-6 top-1 flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                        </div>

                        {/* Content */}
                        <div>
                          <p className="text-sm font-medium text-primary">
                            {deriveTimelineDate(task.timing, eventInput.eventDate)
                              ? `${deriveTimelineDate(task.timing, eventInput.eventDate)} · ${task.timing}`
                              : task.timing}
                          </p>
                          <p className="text-sm text-foreground mt-0.5 leading-relaxed">
                            {task.task}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
