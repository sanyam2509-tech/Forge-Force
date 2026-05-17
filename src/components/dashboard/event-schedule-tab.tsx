"use client";

import { AlertTriangle, CalendarDays, ClipboardList, Clock3, FileText, MapPin, Megaphone, UserRound, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  collectSuggestedAssets,
  collectPRTasks,
  formatDateRange,
  getMainEndDate,
  getMainStartDate,
  validateSchedule,
} from "@/lib/schedule";
import type { EventInput } from "@/lib/types";

interface EventScheduleTabProps {
  eventInput: EventInput;
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function EventScheduleTab({ eventInput }: EventScheduleTabProps) {
  const warnings = validateSchedule(eventInput);
  const subEvents = eventInput.subEvents ?? [];
  const assets = collectSuggestedAssets(eventInput);
  const prTasks = collectPRTasks(eventInput);
  const totalExpected = subEvents.reduce((sum, event) => sum + (Number(event.expectedAudience) || 0), 0);
  const totalActual = subEvents.reduce((sum, event) => sum + (Number(event.actualRegistrations) || 0), 0);
  const totalVolunteers = subEvents.reduce((sum, event) => sum + (Number(event.requiredVolunteers) || 0), 0);

  return (
    <div className="space-y-5">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays className="size-5 text-primary" />
            Event Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
              <p className="text-sm text-muted-foreground">Main event window</p>
              <p className="mt-2 text-2xl font-semibold">{formatDateRange(eventInput)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{formatDate(getMainStartDate(eventInput))}</Badge>
                <Badge variant="secondary">{formatDate(getMainEndDate(eventInput))}</Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {subEvents.length} sub-events
                </Badge>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                  {totalActual || 0}/{totalExpected || eventInput.audienceSize} registrations
                </Badge>
                <Badge variant="outline" className="border-fuchsia-500/30 text-fuchsia-300">
                  {totalVolunteers} sub-event volunteers
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              {warnings.length > 0 ? (
                warnings.map((warning) => (
                  <div
                    key={warning}
                    className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-200"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    {warning}
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
                  Schedule validation looks clean: date range, times, and sub-events are consistent.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Clock3 className="size-5 text-primary" />
              Sub-Events and Rounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subEvents.length > 0 ? (
                subEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-border/60 bg-secondary/30 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {event.roundNumber ? `Round ${event.roundNumber}` : `Milestone ${index + 1}`}
                          </Badge>
                          <Badge variant="secondary">{event.type}</Badge>
                        </div>
                        <p className="mt-2 text-lg font-semibold">{event.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                      </div>
                      <Badge variant="outline">
                        {event.startTime}-{event.endTime}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-primary" />
                        {formatDate(event.startDate)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="size-4 text-primary" />
                        {event.actualRegistrations || 0}/{event.expectedAudience || "TBD"} regs
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" />
                        {event.location || "Location TBD"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <UserRound className="size-3" />
                        {event.coordinatorName || "Coordinator TBD"}
                      </Badge>
                      <Badge variant="secondary">
                        {event.requiredVolunteers || 0} volunteers
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          event.status === "At Risk"
                            ? "border-red-500/30 text-red-300"
                            : "border-primary/30 text-primary"
                        }
                      >
                        {event.status || "Planning"}
                      </Badge>
                    </div>
                    {(event.assets?.length ?? 0) > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {event.assets?.slice(0, 3).map((asset) => (
                          <Badge key={asset.id} variant="secondary" className="gap-1">
                            <FileText className="size-3" />
                            {asset.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No sub-events were added. Simple events can still run from the main schedule.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <ClipboardList className="size-5 text-primary" />
              Forms and Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assets.map((asset) => (
                <div
                  key={`${asset.name}-${asset.neededBy}`}
                  className="rounded-lg border border-border/50 bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{asset.name}</p>
                    <Badge
                      variant="outline"
                      className={
                        asset.priority === "High"
                          ? "border-red-500/30 text-red-300"
                          : "border-primary/30 text-primary"
                      }
                    >
                      {asset.priority}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{asset.purpose}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Needed by {asset.neededBy}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {asset.requiredFields.slice(0, 4).map((field) => (
                      <Badge key={field} variant="secondary">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Megaphone className="size-5 text-primary" />
            Central PR Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {prTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-border/50 bg-secondary/30 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary">{task.channel}</Badge>
                  <Badge
                    variant="outline"
                    className={
                      task.priority === "High"
                        ? "border-red-500/30 text-red-300"
                        : "border-primary/30 text-primary"
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-semibold">{task.title}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Due {task.deadline} · Owner {task.owner} · {task.status}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
