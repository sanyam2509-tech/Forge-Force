import type { EventInput, ReminderItem } from "./types";

function escapeHtml(text: string): string {
  return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function emailHtml(subject: string, body: string, eventTitle: string): string {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;">
<h2 style="color:#1a1a2e;font-size:20px;margin-bottom:16px;">${escapeHtml(subject)}</h2>
<div style="color:#4a4a6a;line-height:1.7;font-size:15px;">${body}</div>
<hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
<p style="color:#9999bb;font-size:13px;">This message was sent by the <strong>${escapeHtml(eventTitle)}</strong> team via EventOS AI.</p>
</div>`;
}

export function generateReminderSchedule(eventInput: EventInput, emailBase: string): ReminderItem[] {
  const { title, eventDate } = eventInput;
  const safeTitle = escapeHtml(title);
  const safeDate = escapeHtml(eventDate);

  const pre: ReminderItem = {
    id: "reminder-pre",
    type: "pre-event",
    label: "Pre-Event Reminder",
    subject: `Reminder: ${title} is coming up!`,
    scheduledTiming: "3 days before event",
    body: emailHtml(`Reminder: ${title} is coming up!`,
      `<p>We're excited to have you join us at <strong>${safeTitle}</strong> on <strong>${safeDate}</strong>.</p>
<p>Please make sure you have everything ready. Here are a few things to keep in mind:</p>
<ul style="padding-left:20px;"><li>Arrive on time</li><li>Bring any required materials</li><li>Check the event schedule</li></ul>
<p>We look forward to seeing you!</p>`, title),
    status: "pending", sentCount: 0, demoCount: 0, failedCount: 0, results: [],
  };

  const dayBefore: ReminderItem = {
    id: "reminder-day-before",
    type: "day-before",
    label: "Day Before Reminder",
    subject: `${title} is tomorrow!`,
    scheduledTiming: "1 day before event",
    body: emailHtml(`${title} is tomorrow!`,
      `<p>Just a quick reminder that <strong>${safeTitle}</strong> is happening <strong>tomorrow</strong>!</p>
<p>We can't wait to see you there. Please check your registration details and come prepared.</p>
<p>See you tomorrow!</p>`, title),
    status: "pending", sentCount: 0, demoCount: 0, failedCount: 0, results: [],
  };

  const dayOf: ReminderItem = {
    id: "reminder-day-of",
    type: "day-of",
    label: "Day-of Welcome",
    subject: `Welcome to ${title} — Today is the day!`,
    scheduledTiming: "Morning of event",
    body: emailHtml(`Welcome to ${title}!`,
      `<p>Today is the day! <strong>${safeTitle}</strong> is happening and we're thrilled you're joining us.</p>
<p>Please check in at the registration desk upon arrival. Our volunteers will be happy to assist you.</p>
<p>Have an amazing time!</p>`, title),
    status: "pending", sentCount: 0, demoCount: 0, failedCount: 0, results: [],
  };

  const postEvent: ReminderItem = {
    id: "reminder-post",
    type: "post-event",
    label: "Post-Event Follow-up",
    subject: `Thank you for attending ${title}!`,
    scheduledTiming: "3 days after event",
    body: emailHtml(`Thank you for attending ${title}!`,
      `<p>Thank you for joining us at <strong>${safeTitle}</strong>! We hope you had a wonderful experience.</p>
<p>We'd love to hear your feedback. Please take a moment to share your thoughts — it helps us make future events even better.</p>
<p>We hope to see you at our next event!</p>`, title),
    status: "pending", sentCount: 0, demoCount: 0, failedCount: 0, results: [],
  };

  return [pre, dayBefore, dayOf, postEvent];
}
