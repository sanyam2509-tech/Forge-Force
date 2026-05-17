"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  List,
  LayoutGrid,
  Clock3,
  User,
  Pencil,
  Check as CheckIcon,
  X as XIcon,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  onUpdate: (id: string, updates: Partial<ChecklistItem>) => void;
  onAdd: (task: Omit<ChecklistItem, "id">) => void;
  onRegenerate: () => void;
}

const priorityStyles: Record<string, string> = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-green-500/10 text-green-400 border-green-500/20",
};

// ── EditRow sub-component ──────────────────────────────────────────────────────

interface EditRowProps {
  item: ChecklistItem;
  onSave: (id: string, updates: Partial<ChecklistItem>) => void;
  onCancel: () => void;
}

function EditRow({ item, onSave, onCancel }: EditRowProps) {
  const [task, setTask] = useState(item.task);
  const [priority, setPriority] = useState<"high" | "medium" | "low">(
    item.priority
  );
  const [deadline, setDeadline] = useState(item.deadline ?? "");
  const [owner, setOwner] = useState(item.owner ?? "");

  const handleSave = () => {
    onSave(item.id, { task, priority, deadline: deadline || undefined, owner: owner || undefined });
  };

  return (
    <div className="flex flex-col gap-2 py-1">
      {/* Task text input */}
      <Input
        value={task}
        onChange={(e) => setTask(e.target.value)}
        className="w-full text-sm h-8"
        autoFocus
      />

      {/* Priority / Deadline / Owner row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Priority select */}
        <Select
          value={priority}
          onValueChange={(val) => setPriority(val as "high" | "medium" | "low")}
        >
          <SelectTrigger size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Deadline input */}
        <Input
          type="text"
          placeholder="e.g. 3 days before"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="text-sm h-7 w-40"
        />

        {/* Owner input */}
        <Input
          type="text"
          placeholder="e.g. Team Lead"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="text-sm h-7 w-36"
        />

        {/* Save */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-green-500"
          onClick={handleSave}
          title="Save"
        >
          <CheckIcon className="size-3.5" />
        </Button>

        {/* Cancel */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          onClick={onCancel}
          title="Cancel"
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── AddTaskForm sub-component ──────────────────────────────────────────────────

interface AddTaskFormProps {
  checklist: ChecklistItem[];
  onAdd: (task: Omit<ChecklistItem, "id">) => void;
  onClose: () => void;
}

function AddTaskForm({ checklist, onAdd, onClose }: AddTaskFormProps) {
  const uniqueCategories = [...new Set(checklist.map((i) => i.category))];

  const [taskText, setTaskText] = useState("");
  const [category, setCategory] = useState(uniqueCategories[0] ?? "");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [deadline, setDeadline] = useState("");
  const [owner, setOwner] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    onAdd({
      task: taskText.trim(),
      category,
      priority,
      deadline: deadline || undefined,
      owner: owner || undefined,
      completed: false,
    });
    // Reset fields
    setTaskText("");
    setCategory(uniqueCategories[0] ?? "");
    setPriority("medium");
    setDeadline("");
    setOwner("");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-4 bg-secondary/20">
      <p className="text-sm font-medium">Add Custom Task</p>

      {/* Task text */}
      <Input
        placeholder="Task description (required)"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        required
        autoFocus
        className="w-full text-sm"
      />

      <div className="flex flex-wrap gap-2">
        {/* Category select */}
        <Select value={category} onValueChange={(val) => { if (val !== null) setCategory(val); }}>
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {uniqueCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority select */}
        <Select
          value={priority}
          onValueChange={(val) => setPriority(val as "high" | "medium" | "low")}
        >
          <SelectTrigger size="sm" className="w-28">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Deadline */}
        <Input
          type="text"
          placeholder="Deadline (e.g. 3 days before)"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="text-sm h-8 w-52"
        />

        {/* Owner */}
        <Input
          type="text"
          placeholder="Owner (e.g. Team Lead)"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="text-sm h-8 w-44"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Add Task
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── BoardTaskCard sub-component ────────────────────────────────────────────────

interface BoardTaskCardProps {
  item: ChecklistItem;
  editingId: string | null;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ChecklistItem>) => void;
  setEditingId: (id: string | null) => void;
}

function BoardTaskCard({
  item,
  editingId,
  onToggle,
  onUpdate,
  setEditingId,
}: BoardTaskCardProps) {
  return (
    <div className="bg-card border rounded-lg p-3 space-y-2">
      {editingId === item.id ? (
        <EditRow
          item={item}
          onSave={(id, updates) => {
            onUpdate(id, updates);
            setEditingId(null);
          }}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <>
          {/* Checkbox + task text */}
          <div className="flex items-start gap-2">
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => onToggle(item.id)}
              className="mt-0.5"
            />
            <span
              className={`flex-1 text-sm leading-relaxed ${
                item.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {item.task}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setEditingId(item.id)}
              title="Edit task"
            >
              <Pencil className="size-3" />
            </Button>
          </div>

          {/* Deadline */}
          {item.deadline && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="size-3" />
              {item.deadline}
            </span>
          )}

          {/* Owner */}
          {item.owner && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="size-3" />
              {item.owner}
            </span>
          )}

          {/* Category badge */}
          <Badge variant="outline" className="text-xs">
            {item.category}
          </Badge>
        </>
      )}
    </div>
  );
}

// ── Main TasksTab component ────────────────────────────────────────────────────

export function TasksTab({
  checklist,
  onToggle,
  onUpdate,
  onAdd,
  onRegenerate,
}: TasksTabProps) {
  const { isCopied, copy } = useCopyToClipboard();

  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Reset editingId whenever viewMode changes
  useEffect(() => {
    setEditingId(null);
  }, [viewMode]);

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

  // Group tasks by category (for list view)
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

  // Board columns
  const boardColumns: {
    key: "high" | "medium" | "low";
    label: string;
    dotClass: string;
    badgeClass: string;
  }[] = [
    {
      key: "high",
      label: "High Priority",
      dotClass: "bg-red-500",
      badgeClass: "bg-red-500/20 text-red-400",
    },
    {
      key: "medium",
      label: "Medium Priority",
      dotClass: "bg-yellow-500",
      badgeClass: "bg-yellow-500/20 text-yellow-400",
    },
    {
      key: "low",
      label: "Low Priority",
      dotClass: "bg-green-500",
      badgeClass: "bg-green-500/20 text-green-400",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Task Checklist</CardTitle>
        <CardAction>
          <div className="flex items-center gap-1">
            {/* View mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${viewMode === "list" ? "bg-secondary text-primary" : "text-muted-foreground"}`}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <List className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${viewMode === "board" ? "bg-secondary text-primary" : "text-muted-foreground"}`}
              onClick={() => setViewMode("board")}
              title="Board view"
            >
              <LayoutGrid className="size-4" />
            </Button>

            <Separator orientation="vertical" className="h-4 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => copy(formatChecklistAsText())}
            >
              {isCopied() ? (
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

          {/* ── LIST VIEW ── */}
          {viewMode === "list" && (
            <>
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    {category}
                  </p>
                  <Separator className="mb-3" />
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id}>
                        {editingId === item.id ? (
                          <EditRow
                            item={item}
                            onSave={(id, updates) => {
                              onUpdate(id, updates);
                              setEditingId(null);
                            }}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <div className="flex items-start gap-3">
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

                            {/* Deadline */}
                            {item.deadline && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock3 className="size-3" />
                                {item.deadline}
                              </span>
                            )}

                            {/* Owner */}
                            {item.owner && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="size-3" />
                                {item.owner}
                              </span>
                            )}

                            <Badge
                              variant="outline"
                              className={priorityStyles[item.priority]}
                            >
                              {item.priority}
                            </Badge>

                            {/* Edit button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={() => setEditingId(item.id)}
                              title="Edit task"
                            >
                              <Pencil className="size-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── BOARD VIEW ── */}
          {viewMode === "board" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {boardColumns.map((col) => {
                const colItems = checklist.filter(
                  (item) => item.priority === col.key
                );
                return (
                  <div key={col.key} className="flex flex-col gap-3">
                    {/* Column header */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2.5 rounded-full ${col.dotClass}`}
                      />
                      <span className="text-sm font-semibold">{col.label}</span>
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${col.badgeClass}`}
                      >
                        {colItems.length}
                      </span>
                    </div>

                    {/* Task cards */}
                    <div className="flex flex-col gap-2">
                      {colItems.map((item) => (
                        <BoardTaskCard
                          key={item.id}
                          item={item}
                          editingId={editingId}
                          onToggle={onToggle}
                          onUpdate={onUpdate}
                          setEditingId={setEditingId}
                        />
                      ))}
                      {colItems.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No tasks
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── ADD TASK ── */}
          {showAddForm ? (
            <AddTaskForm
              checklist={checklist}
              onAdd={onAdd}
              onClose={() => setShowAddForm(false)}
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full border border-dashed border-border text-muted-foreground hover:text-foreground"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="size-3.5 mr-1" />
              Add Task
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
