"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  Sparkles,
  Plus,
  X,
  RefreshCw,
  ChevronLeft,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Volunteer, VolunteerAssignment, EventInput } from "@/lib/types";
import { parseVolunteerCsv } from "@/lib/csv";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function volunteersFromInput(value?: string): Volunteer[] {
  const trimmed = value?.trim();
  if (!trimmed) return [];

  const asCount = Number(trimmed);
  if (Number.isInteger(asCount) && asCount > 0) {
    return Array.from({ length: Math.min(asCount, 40) }, (_, index) => ({
      id: `input-volunteer-${index + 1}`,
      name: `Volunteer ${index + 1}`,
      skills: "",
      availability: "Flexible",
    }));
  }

  return trimmed
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 40)
    .map((name, index) => ({
      id: `input-volunteer-${index + 1}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      skills: "",
      availability: "Flexible",
    }));
}

interface VolunteersTabProps {
  eventInput: EventInput;
}

const AVAILABILITY_OPTIONS = [
  "Full day",
  "Morning only",
  "Afternoon only",
  "Evening only",
  "Flexible",
];

const CATEGORIES = [
  "Core Operations",
  "Guest Experience",
  "Technical",
  "Media & Content",
  "Logistics",
] as const;

type Category = (typeof CATEGORIES)[number];

const categoryDotColor: Record<Category, string> = {
  "Core Operations": "bg-blue-500",
  "Guest Experience": "bg-green-500",
  Technical: "bg-purple-500",
  "Media & Content": "bg-pink-500",
  Logistics: "bg-orange-500",
};

const priorityStyles: Record<string, string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function VolunteersTab({ eventInput }: VolunteersTabProps) {
  const initialVolunteers = useMemo(
    () => volunteersFromInput(eventInput.volunteerNames),
    [eventInput.volunteerNames]
  );
  const didAutoAssignRef = useRef(false);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(
    initialVolunteers
  );
  const [assignments, setAssignments] = useState<VolunteerAssignment[] | null>(
    null
  );
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"setup" | "board">("setup");

  const [newName, setNewName] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newAvailability, setNewAvailability] = useState("Full day");

  const [csvError, setCsvError] = useState<string[]>([]);
  const [csvPreview, setCsvPreview] = useState<Omit<Volunteer, "id">[] | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Add volunteer manually ──────────────────────────────────────────────
  function handleAdd() {
    if (!newName.trim()) return;
    const volunteer: Volunteer = {
      id: generateId(),
      name: newName.trim(),
      skills: newSkills.trim(),
      availability: newAvailability,
    };
    setVolunteers((prev) => [...prev, volunteer]);
    setNewName("");
    setNewSkills("");
    setNewAvailability("Full day");
  }

  function handleRemove(id: string) {
    setVolunteers((prev) => prev.filter((v) => v.id !== id));
  }

  // ── CSV import ──────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseVolunteerCsv(text);
      if (result.errors.length > 0) {
        setCsvError(result.errors);
        setCsvPreview(null);
      } else {
        setCsvPreview(result.rows);
        setCsvError([]);
      }
    };
    reader.readAsText(file);
    // Reset file input so the same file can be re-uploaded
    e.target.value = "";
  }

  function handleImportConfirm() {
    if (!csvPreview) return;
    const newVolunteers: Volunteer[] = csvPreview.map((row) => ({
      id: generateId(),
      ...row,
    }));
    setVolunteers((prev) => [...prev, ...newVolunteers]);
    setCsvPreview(null);
    setCsvError([]);
  }

  function handleImportCancel() {
    setCsvPreview(null);
    setCsvError([]);
  }

  // ── AI role assignment ──────────────────────────────────────────────────
  const handleAssignRoles = useCallback(async () => {
    if (isAssigning || volunteers.length === 0) return;
    setIsAssigning(true);
    setAssignError(null);
    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventInput, volunteers }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to assign roles");
      }
      const data: VolunteerAssignment[] = await res.json();
      setAssignments(data);
      setViewMode("board");
    } catch (err) {
      setAssignError(
        err instanceof Error ? err.message : "Failed to assign roles"
      );
    } finally {
      setIsAssigning(false);
    }
  }, [eventInput, isAssigning, volunteers]);

  useEffect(() => {
    if (didAutoAssignRef.current || initialVolunteers.length === 0) {
      return;
    }
    didAutoAssignRef.current = true;
    void handleAssignRoles();
  }, [handleAssignRoles, initialVolunteers.length]);

  // ── Toggle assignment status ────────────────────────────────────────────
  function handleToggleStatus(volunteerId: string) {
    setAssignments((prev) =>
      prev
        ? prev.map((a) =>
            a.volunteerId === volunteerId
              ? {
                  ...a,
                  status: a.status === "assigned" ? "confirmed" : "assigned",
                }
              : a
          )
        : prev
    );
  }

  // ── Derived values for board ────────────────────────────────────────────
  const categoryCounts: Record<Category, VolunteerAssignment[]> =
    CATEGORIES.reduce(
      (acc, cat) => {
        acc[cat] = (assignments ?? []).filter((a) => a.category === cat);
        return acc;
      },
      {} as Record<Category, VolunteerAssignment[]>
    );

  const categoriesWithAssignments = CATEGORIES.filter(
    (cat) => categoryCounts[cat].length > 0
  ).length;

  // ══════════════════════════════════════════════════════════════════════════
  // Board view
  // ══════════════════════════════════════════════════════════════════════════
  if (viewMode === "board" && assignments !== null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Volunteer Role Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("setup")}
                >
                  <ChevronLeft className="size-3.5 mr-1" />
                  Edit Volunteers
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAssignRoles}
                  disabled={isAssigning}
                >
                  <RefreshCw className="size-3.5 mr-1" />
                  {isAssigning ? "Reassigning..." : "Reassign Roles"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {assignments.length} volunteer
                {assignments.length !== 1 ? "s" : ""} assigned across{" "}
                {categoriesWithAssignments} categor
                {categoriesWithAssignments !== 1 ? "ies" : "y"}
              </p>
            </div>

            {assignError && (
              <p className="text-sm text-red-400">{assignError}</p>
            )}

            {/* Kanban grid */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3" style={{ minWidth: "max-content" }}>
                {CATEGORIES.map((category) => {
                  const colAssignments = categoryCounts[category];
                  return (
                    <div
                      key={category}
                      className="min-w-[220px] flex-shrink-0 flex flex-col gap-2"
                    >
                      {/* Column header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${categoryDotColor[category]}`}
                          />
                          <span className="text-xs font-semibold text-foreground">
                            {category}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs px-1.5">
                          {colAssignments.length}
                        </Badge>
                      </div>

                      {/* Cards */}
                      <div className="flex flex-col gap-2 min-h-[60px]">
                        {colAssignments.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic px-1">
                            No assignments
                          </p>
                        ) : (
                          colAssignments.map((a) => (
                            <div
                              key={a.volunteerId}
                              className="bg-card border border-border/50 rounded-lg p-3 space-y-2 cursor-pointer hover:border-border transition-colors"
                              onClick={() =>
                                handleToggleStatus(a.volunteerId)
                              }
                            >
                              {/* Name */}
                              <p className="font-semibold text-sm leading-snug">
                                {a.volunteerName}
                              </p>

                              {/* Role */}
                              <p className="text-primary text-sm leading-snug">
                                {a.role}
                              </p>

                              {/* Priority + effort */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${priorityStyles[a.priority]}`}
                                >
                                  {a.priority}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {a.estimatedEffort}
                                </span>
                              </div>

                              {/* Status */}
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    a.status === "confirmed"
                                      ? "bg-green-500"
                                      : "bg-yellow-500"
                                  }`}
                                />
                                <span className="text-xs text-muted-foreground capitalize">
                                  {a.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Setup view
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="size-4" />
          Volunteer Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Section 1 — Add manually */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Add Volunteer</p>
            {initialVolunteers.length > 0 && assignments === null && (
              <p className="text-xs text-muted-foreground">
                Loaded {initialVolunteers.length} volunteer
                {initialVolunteers.length !== 1 ? "s" : ""} from
                your event details and assigning roles automatically.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Input
                className="flex-1 min-w-[140px]"
                placeholder="Volunteer name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
              />
              <Input
                className="flex-1 min-w-[180px]"
                placeholder="photography, tech, social media"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
              />
              <Select
                value={newAvailability}
                onValueChange={(v) => setNewAvailability(v ?? "Full day")}
              >
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAdd} size="sm" disabled={!newName.trim()}>
                <Plus className="size-3.5 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Section 2 — CSV import */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5 mr-1" />
                Upload CSV
              </Button>
              <span className="text-xs text-muted-foreground">
                Sample format: name,skills,availability
              </span>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* CSV errors */}
            {csvError.length > 0 && (
              <ul className="space-y-1">
                {csvError.map((err, i) => (
                  <li key={i} className="text-xs text-red-400">
                    {err}
                  </li>
                ))}
              </ul>
            )}

            {/* CSV preview */}
            {csvPreview && csvPreview.length > 0 && (
              <div className="space-y-2 rounded-lg border border-border/50 bg-secondary/30 p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Preview
                </p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-1 font-medium pr-4">Name</th>
                      <th className="pb-1 font-medium pr-4">Skills</th>
                      <th className="pb-1 font-medium">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t border-border/30">
                        <td className="py-1 pr-4">{row.name}</td>
                        <td className="py-1 pr-4 text-muted-foreground">
                          {row.skills || "—"}
                        </td>
                        <td className="py-1 text-muted-foreground">
                          {row.availability}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvPreview.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    …and {csvPreview.length - 5} more
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={handleImportConfirm}>
                    Import {csvPreview.length} volunteer
                    {csvPreview.length !== 1 ? "s" : ""}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleImportCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3 — Volunteer list */}
          {volunteers.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">
                Added Volunteers ({volunteers.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {volunteers.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/50 px-2.5 py-1.5"
                  >
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium text-sm">{v.name}</span>
                      {v.skills && (
                        <span className="text-xs text-muted-foreground">
                          {v.skills}
                        </span>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {v.availability}
                    </Badge>
                    <button
                      onClick={() => handleRemove(v.id)}
                      className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={`Remove ${v.name}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* Assign button */}
          <div className="space-y-2">
            <Button
              className="w-full"
              variant="default"
              disabled={isAssigning || volunteers.length === 0}
              onClick={handleAssignRoles}
            >
              <Sparkles className="size-3.5 mr-2" />
              {isAssigning ? "Assigning roles..." : "Assign Roles with AI"}
            </Button>
            {assignError && (
              <p className="text-sm text-red-400">{assignError}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
