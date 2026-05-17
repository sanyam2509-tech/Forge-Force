"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Clock3,
  Copy,
  MessageSquarePlus,
  Radio,
  ShieldCheck,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { ChecklistItem, EventInput, GeneratedWorkspace } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

type ExecutionStatus = "on-track" | "blocked" | "needs-decision" | "done";

interface ExecutionTrackerTabProps {
  workspace: GeneratedWorkspace;
  eventInput: EventInput;
}

const statusStyles: Record<ExecutionStatus, string> = {
  "on-track": "border-cyan-500/30 text-cyan-300",
  blocked: "border-red-500/30 text-red-300",
  "needs-decision": "border-yellow-500/30 text-yellow-300",
  done: "border-green-500/30 text-green-300",
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function todayIso() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return toIsoDate(date);
}

function addDaysIso(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function deriveDueDate(deadline: string | undefined, eventDate: string) {
  if (!deadline || !eventDate) return undefined;
  const event = new Date(`${eventDate}T12:00:00`);
  if (Number.isNaN(event.getTime())) return undefined;
  const lower = deadline.toLowerCase();
  const dayMatch = lower.match(/(\d+)\s*days?\s*before/);
  const weekMatch = lower.match(/(\d+)\s*weeks?\s*before/);

  if (weekMatch) event.setDate(event.getDate() - Number(weekMatch[1]) * 7);
  else if (dayMatch) event.setDate(event.getDate() - Number(dayMatch[1]));
  else if (lower.includes("day before")) event.setDate(event.getDate() - 1);
  else if (lower.includes("today") || lower.includes("next")) return todayIso();
  else if (lower.includes("event morning")) return eventDate;

  return toIsoDate(event);
}

function getDueDate(task: ChecklistItem, eventInput: EventInput) {
  return task.dueDate ?? deriveDueDate(task.deadline, eventInput.eventDate);
}

function formatDate(value?: string) {
  if (!value) return "No date";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatReport(
  workspace: GeneratedWorkspace,
  statusMap: Record<string, ExecutionStatus>,
  decisions: string[],
  controlItems: { label: string; checked: boolean }[]
) {
  const completed = workspace.checklist.filter(
    (task) => task.completed || statusMap[task.id] === "done"
  );
  const blockers = workspace.checklist.filter(
    (task) => statusMap[task.id] === "blocked"
  );
  const decisionsNeeded = workspace.checklist.filter(
    (task) => statusMap[task.id] === "needs-decision"
  );

  return `EVENT EXECUTION REPORT

Completed tasks: ${completed.length}/${workspace.checklist.length}
Active blockers: ${blockers.length}
Organizer decisions needed: ${decisionsNeeded.length}
Control room ready: ${controlItems.filter((item) => item.checked).length}/${controlItems.length}

BLOCKERS
${blockers.map((task) => `- ${task.task}`).join("\n") || "- None"}

DECISIONS NEEDED
${decisionsNeeded.map((task) => `- ${task.task}`).join("\n") || "- None"}

DECISION LOG
${decisions.map((item) => `- ${item}`).join("\n") || "- No decisions logged yet"}

LESSONS TO CAPTURE
- What slowed the team down?
- Which roles were overloaded?
- Which reminders reduced attendee confusion?
- What should be standardized for the next event?`;
}

export function ExecutionTrackerTab({
  workspace,
  eventInput,
}: ExecutionTrackerTabProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const [statusMap, setStatusMap] = useState<Record<string, ExecutionStatus>>({});
  const [decisionInput, setDecisionInput] = useState("");
  const [decisions, setDecisions] = useState<string[]>([
    "Command channel opened and event lead owns final decisions.",
  ]);
  const [controlItems, setControlItems] = useState([
    { label: "Check-in desk ready", checked: false },
    { label: "AV and Wi-Fi tested", checked: false },
    { label: "Volunteers briefed", checked: false },
    { label: "Final reminder sent", checked: false },
    { label: "Opening script ready", checked: false },
    { label: "Feedback QR / recap owner ready", checked: false },
  ]);

  const today = todayIso();
  const soon = addDaysIso(7);
  const taskGroups = useMemo(() => {
    const active = workspace.checklist.filter((task) => {
      return !task.completed && statusMap[task.id] !== "done";
    });
    return {
      overdue: active.filter((task) => {
        const due = getDueDate(task, eventInput);
        return due && due < today;
      }),
      today: active.filter((task) => getDueDate(task, eventInput) === today),
      upcoming: active.filter((task) => {
        const due = getDueDate(task, eventInput);
        return due && due > today && due <= soon;
      }),
      unowned: active.filter((task) => !task.owner),
    };
  }, [eventInput, soon, statusMap, today, workspace.checklist]);

  const blockers = workspace.checklist.filter(
    (task) => statusMap[task.id] === "blocked"
  );
  const decisionsNeeded = workspace.checklist.filter(
    (task) => statusMap[task.id] === "needs-decision"
  );
  const controlProgress =
    (controlItems.filter((item) => item.checked).length / controlItems.length) * 100;
  const metricCards: {
    label: string;
    value: number;
    icon: LucideIcon;
    color: string;
  }[] = [
    { label: "Due today", value: taskGroups.today.length, icon: Clock3, color: "text-cyan-300" },
    { label: "Overdue", value: taskGroups.overdue.length, icon: AlertTriangle, color: "text-red-300" },
    { label: "Blockers", value: blockers.length, icon: ShieldCheck, color: "text-yellow-300" },
    { label: "Decisions", value: decisionsNeeded.length, icon: MessageSquarePlus, color: "text-fuchsia-300" },
  ];

  const addDecision = () => {
    if (!decisionInput.trim()) return;
    setDecisions((prev) => [decisionInput.trim(), ...prev]);
    setDecisionInput("");
  };

  const updateStatus = (taskId: string, status: ExecutionStatus) => {
    setStatusMap((prev) => ({ ...prev, [taskId]: status }));
  };

  const renderTask = (task: ChecklistItem) => {
    const status = statusMap[task.id] ?? (task.completed ? "done" : "on-track");
    return (
      <div
        key={task.id}
        className="rounded-lg border border-border/50 bg-secondary/30 p-3"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={statusStyles[status]}>
                {status.replace("-", " ")}
              </Badge>
              <Badge variant="secondary">{formatDate(getDueDate(task, eventInput))}</Badge>
              {task.priority === "high" && (
                <Badge variant="outline" className="border-red-500/30 text-red-300">
                  critical
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm font-medium">{task.task}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {task.owner ? `Owner: ${task.owner}` : "No owner assigned"}
            </p>
          </div>
          <Select
            value={status}
            onValueChange={(value) => updateStatus(task.id, value as ExecutionStatus)}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on-track">On track</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="needs-decision">Needs decision</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        {metricCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-3xl font-bold">{value}</p>
                </div>
                <Icon className={`size-5 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <ClipboardList className="size-5 text-primary" />
              Execution Board
            </CardTitle>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copy(
                    formatReport(workspace, statusMap, decisions, controlItems),
                    "execution-report"
                  )
                }
              >
                {isCopied("execution-report") ? (
                  <Check className="mr-1 size-3.5" />
                ) : (
                  <Copy className="mr-1 size-3.5" />
                )}
                Copy Report
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold">Due Today</p>
                {(taskGroups.today.length > 0
                  ? taskGroups.today
                  : taskGroups.upcoming.slice(0, 3)
                ).map(renderTask)}
                {taskGroups.today.length === 0 && taskGroups.upcoming.length === 0 && (
                  <p className="rounded-lg border border-border/50 bg-secondary/30 p-3 text-sm text-muted-foreground">
                    No dated tasks due today. Add due dates to make execution tracking sharper.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Overdue / Blocked</p>
                {[...taskGroups.overdue, ...blockers].slice(0, 5).map(renderTask)}
                {taskGroups.overdue.length === 0 && blockers.length === 0 && (
                  <p className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
                    No overdue or blocked work currently flagged.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Radio className="size-5 text-primary" />
                Event-Day Control Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Control readiness</span>
                  <span>{Math.round(controlProgress)}%</span>
                </div>
                <Progress value={controlProgress} />
              </div>
              <div className="space-y-3">
                {controlItems.map((item, index) => (
                  <label
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3 text-sm"
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) => {
                        setControlItems((prev) =>
                          prev.map((existing, i) =>
                            i === index ? { ...existing, checked: Boolean(checked) } : existing
                          )
                        );
                      }}
                    />
                    <span className={item.checked ? "text-muted-foreground line-through" : ""}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Decision Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 grid gap-2 md:grid-cols-[1fr_auto]">
                <Input
                  placeholder="Log decision or incident"
                  value={decisionInput}
                  onChange={(event) => setDecisionInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addDecision();
                  }}
                />
                <Button onClick={addDecision} disabled={!decisionInput.trim()}>
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {decisions.map((decision, index) => (
                  <div
                    key={`${decision}-${index}`}
                    className="rounded-lg border border-border/50 bg-secondary/30 p-3 text-sm text-muted-foreground"
                  >
                    {decision}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
