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
import type { TimelinePhase } from "@/lib/types";

interface TimelineTabProps {
  timeline: TimelinePhase[];
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

export function TimelineTab({ timeline, onRegenerate }: TimelineTabProps) {
  const { isCopied, copy } = useCopyToClipboard();

  const formatAllAsText = () => {
    return timeline
      .map((phase) => {
        const config = phaseConfig[phase.phase];
        const header = config?.label ?? phase.phase;
        const tasks = phase.tasks
          .map((t) => `  [${t.timing}] ${t.task}`)
          .join("\n");
        return `${header}\n${tasks}`;
      })
      .join("\n\n");
  };

  const formatPhaseAsText = (phase: TimelinePhase) => {
    const config = phaseConfig[phase.phase];
    const header = config?.label ?? phase.phase;
    return `${header}\n${phase.tasks.map((t) => `  [${t.timing}] ${t.task}`).join("\n")}`;
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
                            {task.timing}
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
