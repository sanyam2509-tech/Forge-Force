"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function EventForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [audienceType, setAudienceType] = useState("");
  const [audienceSize, setAudienceSize] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventGoal, setEventGoal] = useState("");
  const [tone, setTone] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields including custom selects
    const errors: Record<string, string> = {};
    if (!eventType) errors.eventType = "Please select an event type.";
    if (!audienceType) errors.audienceType = "Please select an audience type.";
    if (!title) errors.title = "Please enter an event title.";
    if (!audienceSize) errors.audienceSize = "Please enter expected audience size.";
    if (!eventDate) errors.eventDate = "Please select an event date.";

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
      eventDate,
      eventGoal,
      tone,
      additionalNotes,
    };

    // Store the full input in localStorage so the dashboard survives refresh
    localStorage.setItem("eventos-input", JSON.stringify(input));

    // Navigate to the dashboard
    router.push(
      `/dashboard?title=${encodeURIComponent(title)}&type=${encodeURIComponent(eventType)}`
    );
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Event Details</CardTitle>
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
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
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
