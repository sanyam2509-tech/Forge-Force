"use client";

import { Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { ChecklistItem } from "@/lib/types";

interface TasksTabProps {
  checklist: ChecklistItem[];
  onToggle: (id: string) => void;
  onRegenerate: () => void;
}

const priorityStyles: Record<string, string> = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-green-500/10 text-green-400 border-green-500/20",
};

export function TasksTab({ checklist, onToggle, onRegenerate }: TasksTabProps) {
  const { copied, copy } = useCopyToClipboard();

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progressValue = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const formatChecklistAsText = () => {
    return checklist
      .map(
        (item) =>
          `${item.completed ? "[x]" : "[ ]"} [${item.priority.toUpperCase()}] ${item.task} (${item.category})`
      )
      .join("\n");
  };

  // Group tasks by category
  const grouped = checklist.reduce<Record<string, ChecklistItem[]>>(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Task Checklist</CardTitle>
        <CardAction>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copy(formatChecklistAsText())}
            >
              {copied ? (
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
              Regenerate
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedCount} of {totalCount} tasks completed
              </span>
              <span className="font-medium">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} />
          </div>

          {/* Grouped tasks */}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {category}
              </p>
              <Separator className="mb-3" />
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3"
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => onToggle(item.id)}
                      className="mt-0.5"
                    />
                    <span
                      className={`flex-1 text-sm leading-relaxed ${
                        item.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {item.task}
                    </span>
                    <Badge
                      variant="outline"
                      className={priorityStyles[item.priority]}
                    >
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
