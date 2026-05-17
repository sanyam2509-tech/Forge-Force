export function escapeHtml(text: string): string {
  return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// Convert a plain-text communication item content into { subject, html }
// Looks for a line starting with "Subject:" and uses it; otherwise generates from eventTitle
export function communicationTextToEmailHtml(content: string, eventTitle: string): { subject: string; html: string } {
  const lines = content.split("\n");
  let subject = `Update from ${eventTitle}`;
  let bodyLines = lines;

  const subjectLine = lines.find(l => l.trim().toLowerCase().startsWith("subject:"));
  if (subjectLine) {
    subject = subjectLine.replace(/^subject:\s*/i, "").trim();
    bodyLines = lines.filter(l => l !== subjectLine);
  }

  const htmlBody = bodyLines
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(l => `<p style="color:#4a4a6a;line-height:1.7;font-size:15px;">${escapeHtml(l)}</p>`)
    .join("\n");

  const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;">
<h2 style="color:#1a1a2e;font-size:20px;margin-bottom:16px;">${escapeHtml(subject)}</h2>
${htmlBody}
<hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
<p style="color:#9999bb;font-size:13px;">Sent via EventOS AI for <strong>${escapeHtml(eventTitle)}</strong></p>
</div>`;

  return { subject, html };
}
