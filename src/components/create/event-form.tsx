"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventInput } from "@/lib/types";
import type { SubEvent } from "@/lib/types";
import { suggestAscentTechFest, suggestSubEvents, validateSchedule } from "@/lib/schedule";

export function EventForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [audienceType, setAudienceType] = useState("");
  const [audienceSize, setAudienceSize] = useState("");
  const [mainStartDate, setMainStartDate] = useState("");
  const [mainEndDate, setMainEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [eventGoal, setEventGoal] = useState("");
  const [tone, setTone] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [volunteerNames, setVolunteerNames] = useState("");
  const [venue, setVenue] = useState("");
  const [subEvents, setSubEvents] = useState<SubEvent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleDemoFill = () => {
    setTitle("AI Hackathon");
    setEventType("Hackathon");
    setAudienceType("Students");
    setAudienceSize("300");
    setMainStartDate("2026-06-20");
    setMainEndDate("2026-06-21");
    setStartTime("09:00");
    setEndTime("18:00");
    setEventGoal(
      "Run a high-energy hackathon with smooth operations, social media coverage, reminders, and final demos."
    );
    setTone("Energetic");
    setAdditionalNotes(
      "Include registration flow, mentor coordination, AV readiness, food logistics, judging support, and post-event recap."
    );
    setVolunteerNames("8");
    const demoInput = {
      title: "AI Hackathon",
      eventType: "Hackathon",
      audienceType: "Students",
      audienceSize: "300",
      eventDate: "2026-06-20",
      mainStartDate: "2026-06-20",
      mainEndDate: "2026-06-21",
      startTime: "09:00",
      endTime: "18:00",
      eventGoal:
        "Run a high-energy hackathon with smooth operations, social media coverage, reminders, and final demos.",
      volunteerNames: "8",
    };
    setSubEvents(suggestSubEvents(demoInput));
    setValidationErrors({});
  };

  const loadInput = (input: EventInput) => {
    setTitle(input.title);
    setEventType(input.eventType);
    setAudienceType(input.audienceType);
    setAudienceSize(input.audienceSize);
    setMainStartDate(input.mainStartDate || input.eventDate);
    setMainEndDate(input.mainEndDate || input.mainStartDate || input.eventDate);
    setStartTime(input.startTime || "09:00");
    setEndTime(input.endTime || "18:00");
    setEventGoal(input.eventGoal || "");
    setTone(input.tone || "Energetic");
    setAdditionalNotes(input.additionalNotes || "");
    setVolunteerNames(input.volunteerNames || "");
    setVenue(input.venue || "");
    setSubEvents(input.subEvents || []);
    setValidationErrors({});
  };

  const handleAscentDemo = () => {
    loadInput(suggestAscentTechFest());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields including custom selects
    const errors: Record<string, string> = {};
    if (!eventType) errors.eventType = "Please select an event type.";
    if (!audienceType) errors.audienceType = "Please select an audience type.";
    if (!title) errors.title = "Please enter an event title.";
    if (!audienceSize) errors.audienceSize = "Please enter expected audience size.";
    if (!mainStartDate) errors.mainStartDate = "Please select a start date.";
    if (!mainEndDate) errors.mainEndDate = "Please select an end date.";
    if (mainStartDate && mainEndDate && mainEndDate < mainStartDate) {
      errors.mainEndDate = "End date cannot be before start date.";
    }
    if (mainStartDate === mainEndDate && startTime && endTime && endTime <= startTime) {
      errors.endTime = "End time must be after start time.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    const input: EventInput = {
      title,
      eventType,
      audienceType,
      audienceSize,
      eventDate: mainStartDate,
      mainStartDate,
      mainEndDate,
      startTime,
      endTime,
      eventGoal,
      tone,
      additionalNotes,
      volunteerNames,
      venue,
      subEvents,
    };

    // Store the full input in localStorage so the dashboard survives refresh
    localStorage.setItem("eventos-input", JSON.stringify(input));

    // Navigate to the dashboard
    router.push(
      `/dashboard?title=${encodeURIComponent(title)}&type=${encodeURIComponent(eventType)}`
    );
  };

  const currentInput: EventInput = {
    title: title || "Untitled Event",
    eventType: eventType || "Event",
    audienceType: audienceType || "Audience",
    audienceSize: audienceSize || "100",
    eventDate: mainStartDate,
    mainStartDate,
    mainEndDate,
    startTime,
    endTime,
    eventGoal,
    additionalNotes,
    volunteerNames,
    venue,
    subEvents,
  };
  const scheduleWarnings = validateSchedule(currentInput);

  const handleSuggestSubEvents = () => {
    if (!eventType || !mainStartDate || !mainEndDate) {
      setValidationErrors((prev) => ({
        ...prev,
        eventType: !eventType ? "Please select an event type first." : prev.eventType,
        mainStartDate: !mainStartDate ? "Please select a start date first." : prev.mainStartDate,
        mainEndDate: !mainEndDate ? "Please select an end date first." : prev.mainEndDate,
      }));
      return;
    }
    setSubEvents(suggestSubEvents(currentInput));
    setValidationErrors({});
  };

  const addBlankSubEvent = () => {
    setSubEvents((prev) => [
      ...prev,
      {
        id: `subevent-custom-${Date.now()}`,
        name: "New Sub-Event",
        type: "Session",
        startDate: mainStartDate,
        endDate: mainStartDate || mainEndDate,
        startTime: startTime || "09:00",
        endTime: endTime || "10:00",
        expectedAudience: audienceSize,
        description: "Describe the purpose and operational needs.",
        roundNumber: "",
        location: "Main venue / platform",
        requiredVolunteers: "2",
      },
    ]);
  };

  const updateSubEvent = (id: string, updates: Partial<SubEvent>) => {
    setSubEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...updates } : event))
    );
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-xl">Event Details</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDemoFill}
            disabled={isSubmitting}
          >
            <Wand2 className="mr-2 size-3.5" />
            Demo Example
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Event Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="e.g., TechFest 2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={eventType}
                onValueChange={(v) => {
                  setEventType(v ?? "");
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next.eventType;
                    return next;
                  });
                }}
              >
                <SelectTrigger id="eventType" aria-invalid={!!validationErrors.eventType}>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hackathon">Hackathon</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Meetup">Meetup</SelectItem>
                  <SelectItem value="Webinar">Webinar</SelectItem>
                  <SelectItem value="Social Event">Social Event</SelectItem>
                  <SelectItem value="Fundraiser">Fundraiser</SelectItem>
                  <SelectItem value="Competition">Competition</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.eventType && (
                <p className="text-sm text-red-400">{validationErrors.eventType}</p>
              )}
            </div>

            {/* Audience Type */}
            <div className="space-y-2">
              <Label htmlFor="audienceType">Audience Type</Label>
              <Select
                value={audienceType}
                onValueChange={(v) => {
                  setAudienceType(v ?? "");
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next.audienceType;
                    return next;
                  });
                }}
              >
                <SelectTrigger id="audienceType" aria-invalid={!!validationErrors.audienceType}>
                  <SelectValue placeholder="Select audience type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Students">Students</SelectItem>
                  <SelectItem value="Professionals">Professionals</SelectItem>
                  <SelectItem value="Developers">Developers</SelectItem>
                  <SelectItem value="General Public">General Public</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.audienceType && (
                <p className="text-sm text-red-400">{validationErrors.audienceType}</p>
              )}
            </div>

            {/* Audience Size */}
            <div className="space-y-2">
              <Label htmlFor="audienceSize">Expected Audience Size</Label>
              <Input
                id="audienceSize"
                type="number"
                min={1}
                max={100000}
                placeholder="e.g., 200"
                value={audienceSize}
                onChange={(e) => setAudienceSize(e.target.value)}
                required
              />
            </div>

            {/* Event Date */}
            <div className="space-y-2">
              <Label htmlFor="mainStartDate">Main Event Start Date</Label>
              <Input
                id="mainStartDate"
                type="date"
                value={mainStartDate}
                onChange={(e) => {
                  setMainStartDate(e.target.value);
                  if (!mainEndDate) setMainEndDate(e.target.value);
                }}
                required
              />
              {validationErrors.mainStartDate && (
                <p className="text-sm text-red-400">{validationErrors.mainStartDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainEndDate">Main Event End Date</Label>
              <Input
                id="mainEndDate"
                type="date"
                value={mainEndDate}
                onChange={(e) => setMainEndDate(e.target.value)}
                required
              />
              {validationErrors.mainEndDate && (
                <p className="text-sm text-red-400">{validationErrors.mainEndDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              {validationErrors.endTime && (
                <p className="text-sm text-red-400">{validationErrors.endTime}</p>
              )}
            </div>

            {/* Tone/Vibe */}
            <div className="space-y-2">
              <Label htmlFor="tone">Tone / Vibe</Label>
              <Select value={tone} onValueChange={(v) => setTone(v ?? "")}>
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Energetic">Energetic</SelectItem>
                  <SelectItem value="Inspirational">Inspirational</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Fun">Fun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Event Goal — full width */}
          <div className="space-y-2">
            <Label htmlFor="eventGoal">Event Goal</Label>
            <Textarea
              id="eventGoal"
              placeholder="What do you want to achieve with this event?"
              rows={3}
              value={eventGoal}
              onChange={(e) => setEventGoal(e.target.value)}
            />
          </div>

          {/* Additional Notes — full width */}
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              placeholder="Any specific requirements, themes, or ideas..."
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="volunteerNames">Volunteers</Label>
            <Textarea
              id="volunteerNames"
              placeholder="Enter volunteer names separated by commas, or enter a count like 8"
              rows={3}
              value={volunteerNames}
              onChange={(e) => setVolunteerNames(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              EventOS will infer roles from the event type, so no role planning
              homework for you.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue / Parent Event Location</Label>
            <Input
              id="venue"
              placeholder="e.g., Main Campus Convention Block"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border/60 bg-secondary/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Sub-Events / Rounds</p>
                <p className="text-sm text-muted-foreground">
                  Add rounds, sessions, auditions, submissions, or milestones.
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleSuggestSubEvents}>
                  <Wand2 className="mr-2 size-3.5" />
                  Suggest Sub-Events
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleAscentDemo}>
                  Load Ascent Tech Fest Demo
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={addBlankSubEvent}>
                  <Plus className="mr-2 size-3.5" />
                  Add
                </Button>
              </div>
            </div>

            {scheduleWarnings.length > 0 && (
              <div className="space-y-2">
                {scheduleWarnings.slice(0, 4).map((warning) => (
                  <div
                    key={warning}
                    className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2 text-sm text-yellow-200"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    {warning}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {subEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-border/50 bg-background/35 p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {event.roundNumber ? `Round ${event.roundNumber}` : `Milestone ${index + 1}`}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setSubEvents((prev) => prev.filter((item) => item.id !== event.id))
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      value={event.name}
                      onChange={(e) => updateSubEvent(event.id, { name: e.target.value })}
                      placeholder="Sub-event name"
                    />
                    <Input
                      value={event.type}
                      onChange={(e) => updateSubEvent(event.id, { type: e.target.value })}
                      placeholder="Type"
                    />
                    <Input
                      type="date"
                      value={event.startDate}
                      onChange={(e) => updateSubEvent(event.id, { startDate: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={event.endDate}
                      onChange={(e) => updateSubEvent(event.id, { endDate: e.target.value })}
                    />
                    <Input
                      type="time"
                      value={event.startTime}
                      onChange={(e) => updateSubEvent(event.id, { startTime: e.target.value })}
                    />
                    <Input
                      type="time"
                      value={event.endTime}
                      onChange={(e) => updateSubEvent(event.id, { endTime: e.target.value })}
                    />
                    <Input
                      value={event.expectedAudience}
                      onChange={(e) => updateSubEvent(event.id, { expectedAudience: e.target.value })}
                      placeholder="Expected audience"
                    />
                    <Input
                      value={event.location}
                      onChange={(e) => updateSubEvent(event.id, { location: e.target.value })}
                      placeholder="Location / platform"
                    />
                    <Input
                      value={event.actualRegistrations ?? ""}
                      onChange={(e) => updateSubEvent(event.id, { actualRegistrations: e.target.value })}
                      placeholder="Actual registrations"
                    />
                    <Input
                      value={event.coordinatorName ?? ""}
                      onChange={(e) => updateSubEvent(event.id, { coordinatorName: e.target.value })}
                      placeholder="Coordinator name"
                    />
                    <Input
                      value={event.coordinatorContact ?? ""}
                      onChange={(e) => updateSubEvent(event.id, { coordinatorContact: e.target.value })}
                      placeholder="Coordinator contact"
                    />
                    <Input
                      value={event.volunteerNames ?? ""}
                      onChange={(e) => updateSubEvent(event.id, { volunteerNames: e.target.value })}
                      placeholder="Volunteer names"
                    />
                    <Input
                      value={event.status ?? "Planning"}
                      onChange={(e) => updateSubEvent(event.id, { status: e.target.value as SubEvent["status"] })}
                      placeholder="Status"
                    />
                    <Input
                      value={event.roundNumber ?? ""}
                      onChange={(e) => updateSubEvent(event.id, { roundNumber: e.target.value })}
                      placeholder="Round number"
                    />
                    <Input
                      value={event.requiredVolunteers ?? ""}
                      onChange={(e) => updateSubEvent(event.id, { requiredVolunteers: e.target.value })}
                      placeholder="Required volunteers"
                    />
                  </div>
                  <Textarea
                    className="mt-3"
                    value={event.description}
                    onChange={(e) => updateSubEvent(event.id, { description: e.target.value })}
                    placeholder="Description"
                  />
                </div>
              ))}
              {subEvents.length === 0 && (
                <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No sub-events yet. Use suggestions for hackathons, workshops,
                  cultural events, recruitment drives, and conferences.
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Generating..."
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Generate Workspace
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
