"use client";

import { useState, useRef } from "react";
import {
  Bell,
  Plus,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import type {
  Participant,
  ReminderItem,
  EmailSendResult,
  CommunicationItem,
  EventInput,
} from "@/lib/types";
import { generateReminderSchedule } from "@/lib/reminder-templates";
import { parseParticipantCsv } from "@/lib/csv";

interface RemindersTabProps {
  eventInput: EventInput;
  communication: CommunicationItem[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function statusBadgeClass(status: ReminderItem["status"]): string {
  switch (status) {
    case "sent":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "demo":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "partial":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "failed":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
}

function computeStatus(
  sentCount: number,
  demoCount: number,
  failedCount: number
): ReminderItem["status"] {
  if (failedCount === 0 && sentCount + demoCount > 0) {
    if (demoCount > 0 && sentCount === 0) return "demo";
    return "sent";
  }
  if ((sentCount + demoCount) > 0 && failedCount > 0) return "partial";
  if (sentCount === 0 && demoCount === 0 && failedCount > 0) return "failed";
  return "pending";
}

export function RemindersTab({ eventInput, communication }: RemindersTabProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[] | null>(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendingProgress, setSendingProgress] = useState<string>("");
  const [csvError, setCsvError] = useState<string[]>([]);
  const [csvPreview, setCsvPreview] = useState<Omit<Participant, "id">[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Section 1: Participant management ─────────────────────────────────────

  function handleAddParticipant() {
    if (!newName.trim()) return;
    if (!emailRegex.test(newEmail.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    const entry: Participant = {
      id: generateId(),
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
    };
    setParticipants((prev) => [...prev, entry]);
    setNewName("");
    setNewEmail("");
  }

  function handleRemoveParticipant(id: string) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // reset input so same file can be re-selected
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseParticipantCsv(text);
      if (result.errors.length > 0 && result.rows.length === 0) {
        setCsvError(result.errors);
        setCsvPreview(null);
      } else {
        setCsvError(result.errors);
        setCsvPreview(result.rows);
      }
    };
    reader.readAsText(file);
  }

  function handleConfirmImport() {
    if (!csvPreview) return;
    const existingEmails = new Set(participants.map((p) => p.email));
    const newEntries: Participant[] = csvPreview
      .filter((row) => !existingEmails.has(row.email))
      .map((row) => ({ id: generateId(), name: row.name, email: row.email }));
    setParticipants((prev) => [...prev, ...newEntries]);
    setCsvPreview(null);
    setCsvError([]);
  }

  function handleCancelImport() {
    setCsvPreview(null);
    setCsvError([]);
  }

  // ── Section 2: Generate schedule ──────────────────────────────────────────

  function handleGenerateSchedule() {
    const emailItem = communication.find((item) => item.type === "email");
    const generated = generateReminderSchedule(
      eventInput,
      emailItem?.content ?? ""
    );
    setReminders(generated);
  }

  // ── Section 3: Sending logic ───────────────────────────────────────────────

  async function doSendToList(
    reminder: ReminderItem,
    targetParticipants: Participant[],
    isRetry: boolean
  ) {
    setSendingId(reminder.id);
    setSendingProgress(`0 / ${targetParticipants.length}`);

    // On retry the caller has already stripped failed results from reminder,
    // so we start from the counts that reflect what's actually in reminder.results.
    let sentCount = isRetry ? reminder.sentCount : 0;
    let demoCount = isRetry ? reminder.demoCount : 0;
    let failedCount = isRetry ? reminder.failedCount : 0;

    // Keep the non-failed results on retry; start fresh on a normal send.
    const baseResults: EmailSendResult[] = isRetry
      ? reminder.results.filter((r) => r.status !== "failed")
      : [];
    const newResults: EmailSendResult[] = [];

    for (let i = 0; i < targetParticipants.length; i++) {
      const p = targetParticipants[i];
      setSendingProgress(`${i + 1} / ${targetParticipants.length}`);

      let resStatus: "sent" | "demo" | "failed" = "failed";
      let resError: string | undefined;

      try {
        const response = await fetch("/api/send-reminder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.NEXT_PUBLIC_INTERNAL_API_SECRET
              ? { "x-internal-token": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET }
              : {}),
          },
          body: JSON.stringify({
            to: p.email,
            subject: reminder.subject,
            html: reminder.body,
            eventTitle: eventInput.title,
          }),
        });
        const res = await response.json() as {
          status?: "sent" | "demo" | "failed";
          error?: string;
        };

        if (res.status === "demo") {
          demoCount++;
          resStatus = "demo";
        } else if (res.status === "sent") {
          sentCount++;
          resStatus = "sent";
        } else {
          failedCount++;
          resStatus = "failed";
          resError = res.error;
        }
      } catch (err) {
        failedCount++;
        resStatus = "failed";
        resError = err instanceof Error ? err.message : "Network error";
      }

      newResults.push({
        participantId: p.id,
        email: p.email,
        status: resStatus,
        error: resError,
      });

      // Live-update the reminder in state after each send
      const currentResults = [...baseResults, ...newResults];
      setReminders((prev) =>
        prev
          ? prev.map((r) =>
              r.id === reminder.id
                ? {
                    ...r,
                    sentCount,
                    demoCount,
                    failedCount,
                    results: currentResults,
                    status: computeStatus(sentCount, demoCount, failedCount),
                  }
                : r
            )
          : prev
      );
    }

    setSendingId(null);
    setSendingProgress("");
  }

  async function handleSendToAll(reminder: ReminderItem) {
    await doSendToList(reminder, participants, false);
  }

  async function handleRetryFailed(reminder: ReminderItem) {
    const failedEmails = new Set(
      reminder.results
        .filter((r) => r.status === "failed")
        .map((r) => r.email)
    );
    const failedParticipants = participants.filter((p) =>
      failedEmails.has(p.email)
    );

    // Before retrying: remove failed count for those we'll re-attempt
    setReminders((prev) =>
      prev
        ? prev.map((r) =>
            r.id === reminder.id
              ? {
                  ...r,
                  failedCount: r.failedCount - failedParticipants.length,
                  results: r.results.filter((res) => res.status !== "failed"),
                }
              : r
          )
        : prev
    );

    // Get the updated reminder for accurate counts
    const updatedReminder: ReminderItem = {
      ...reminder,
      failedCount: reminder.failedCount - failedParticipants.length,
      results: reminder.results.filter((res) => res.status !== "failed"),
    };

    await doSendToList(updatedReminder, failedParticipants, true);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Participant Management Card ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Participants
            <Badge variant="secondary" className="text-xs">
              {participants.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {/* Manual add row */}
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Add manually
              </p>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddParticipant()}
                  className="flex-1 min-w-32"
                />
                <div className="flex-1 min-w-40 space-y-1">
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleAddParticipant()}
                    aria-invalid={emailError ? true : undefined}
                  />
                  {emailError && (
                    <p className="text-xs text-destructive">{emailError}</p>
                  )}
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddParticipant}
                  disabled={!newName.trim() || !newEmail.trim()}
                >
                  <Plus className="size-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* CSV Import */}
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
                  Sample format: name,email
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* CSV errors */}
              {csvError.length > 0 && (
                <div className="space-y-0.5">
                  {csvError.map((err, i) => (
                    <p key={i} className="text-xs text-destructive">
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {/* CSV Preview */}
              {csvPreview && (
                <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Preview ({csvPreview.length} participant
                    {csvPreview.length !== 1 ? "s" : ""})
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="text-left pb-1 pr-4 font-medium">Name</th>
                        <th className="text-left pb-1 font-medium">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {csvPreview.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td className="py-1 pr-4 truncate max-w-[140px]">
                            {row.name}
                          </td>
                          <td className="py-1 truncate max-w-[200px] text-muted-foreground">
                            {row.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvPreview.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      and {csvPreview.length - 5} more…
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleConfirmImport}
                    >
                      Import {csvPreview.length} participant
                      {csvPreview.length !== 1 ? "s" : ""}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelImport}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Participant chips */}
            {participants.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-sm"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.email}
                    </span>
                    <button
                      onClick={() => handleRemoveParticipant(p.id)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                      aria-label={`Remove ${p.name}`}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Generate Schedule button */}
            <Button
              variant="default"
              className="w-full"
              disabled={participants.length === 0}
              onClick={handleGenerateSchedule}
            >
              <Bell className="size-4 mr-2" />
              Generate Reminder Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Reminder Queue ────────────────────────────────────────────────── */}
      {reminders !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Reminder Queue
              <Badge variant="secondary" className="text-xs">
                {reminders.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reminders.map((reminder) => {
                const isExpanded = expandedId === reminder.id;
                const isSending = sendingId === reminder.id;
                const failedResults = reminder.results.filter(
                  (r) => r.status === "failed"
                );
                const progressTotal = reminder.sentCount + reminder.demoCount;
                const showProgress =
                  reminder.sentCount > 0 || reminder.demoCount > 0;
                const progressPct =
                  participants.length > 0
                    ? Math.round((progressTotal / participants.length) * 100)
                    : 0;

                const bodyPreview = reminder.body
                  .replace(/<[^>]+>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 300);

                return (
                  <div
                    key={reminder.id}
                    className="bg-card border border-border/50 rounded-lg p-4 space-y-3"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">
                          {reminder.label}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {reminder.scheduledTiming}
                        </Badge>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(reminder.status)}`}
                        >
                          {reminder.status}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : reminder.id)
                        }
                        className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </button>
                    </div>

                    {/* Subject */}
                    <p className="text-sm font-medium truncate text-foreground/90">
                      {reminder.subject}
                    </p>

                    {/* Progress bar */}
                    {showProgress && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {progressTotal} of {participants.length} sent
                        </p>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="space-y-3">
                        {/* Body preview */}
                        <div className="rounded bg-secondary/30 p-3 text-xs text-muted-foreground leading-relaxed">
                          {bodyPreview}
                          {reminder.body
                            .replace(/<[^>]+>/g, " ")
                            .replace(/\s+/g, " ")
                            .trim().length > 300 && "…"}
                        </div>

                        {/* Results table */}
                        {reminder.results.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-muted-foreground border-b border-border/30">
                                  <th className="text-left py-1.5 pr-3 font-medium">
                                    Name
                                  </th>
                                  <th className="text-left py-1.5 pr-3 font-medium">
                                    Email
                                  </th>
                                  <th className="text-left py-1.5 font-medium">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/20">
                                {reminder.results.map((result) => {
                                  const participant = participants.find(
                                    (p) => p.id === result.participantId
                                  );
                                  const isSentOrDemo =
                                    result.status === "sent" ||
                                    result.status === "demo";
                                  return (
                                    <tr key={result.participantId}>
                                      <td className="py-1.5 pr-3 font-medium">
                                        {participant?.name ?? "—"}
                                      </td>
                                      <td className="py-1.5 pr-3 text-muted-foreground truncate max-w-[180px]">
                                        {result.email}
                                      </td>
                                      <td className="py-1.5">
                                        {isSentOrDemo ? (
                                          <span className="inline-flex items-center gap-1 text-green-400">
                                            <Check className="size-3" />
                                            {result.status}
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-red-400">
                                            <X className="size-3" />
                                            failed
                                            {result.error && (
                                              <span className="text-muted-foreground ml-1">
                                                ({result.error})
                                              </span>
                                            )}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <Button
                        variant="default"
                        className="flex-1"
                        disabled={isSending}
                        onClick={() => handleSendToAll(reminder)}
                      >
                        {isSending ? (
                          <>
                            <RefreshCw className="size-3.5 mr-2 animate-spin" />
                            {sendingProgress
                              ? `Sending... (${sendingProgress})`
                              : "Sending..."}
                          </>
                        ) : (
                          <>
                            <Send className="size-3.5 mr-2" />
                            Send to All
                          </>
                        )}
                      </Button>

                      {failedResults.length > 0 && (
                        <Button
                          variant="outline"
                          disabled={isSending}
                          onClick={() => handleRetryFailed(reminder)}
                        >
                          <RefreshCw className="size-3.5 mr-1" />
                          Retry Failed ({failedResults.length})
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
