"use client";

import { Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { EventBrief } from "@/lib/types";

interface OverviewTabProps {
  brief: EventBrief;
  onRegenerate: () => void;
}

export function OverviewTab({ brief, onRegenerate }: OverviewTabProps) {
  const { copied, copy } = useCopyToClipboard();

  const formatBriefAsText = () => {
    const lines = [
      "EVENT BRIEF",
      "",
      "Summary:",
      brief.summary,
      "",
      "Objectives:",
      ...brief.objectives.map((o) => `• ${o}`),
      "",
      "Target Audience:",
      brief.audience,
      "",
      "Execution Goals:",
      ...brief.executionGoals.map((g) => `• ${g}`),
    ];
    return lines.join("\n");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Event Brief</CardTitle>
        <CardAction>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copy(formatBriefAsText())}
            >
              {copied ? (
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
            <Button variant="ghost" size="sm" onClick={onRegenerate}>
              <RefreshCw className="size-3.5 mr-1" />
              Regenerate
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary */}
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Summary
            </p>
            <p className="text-sm leading-relaxed">{brief.summary}</p>
          </div>

          {/* Objectives */}
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Objectives
            </p>
            <ul className="space-y-2">
              {brief.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span className="leading-relaxed">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Target Audience */}
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Target Audience
            </p>
            <p className="text-sm leading-relaxed">{brief.audience}</p>
          </div>

          {/* Execution Goals */}
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Execution Goals
            </p>
            <ul className="space-y-2">
              {brief.executionGoals.map((goal, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span className="leading-relaxed">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
