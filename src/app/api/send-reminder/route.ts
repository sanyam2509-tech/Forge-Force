import { NextResponse } from "next/server";
import { Resend } from "resend";

interface SendReminderRequest {
  to: string;
  subject: string;
  html: string;
  eventTitle: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    // ── Authentication ───────────────────────────────────────────────────────
    // Require an internal API secret so this endpoint cannot be used as an open
    // email relay by arbitrary external callers.
    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (internalSecret) {
      const providedToken = request.headers.get("x-internal-token");
      if (!providedToken || providedToken !== internalSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body: SendReminderRequest = await request.json();

    if (!body.to || !body.subject || !body.html) {
      return NextResponse.json({ error: "Missing required fields: to, subject, html" }, { status: 400 });
    }
    if (!emailRegex.test(body.to)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      await new Promise<void>((resolve) => setTimeout(resolve, 800));
      return NextResponse.json({
        id: `demo-${Date.now()}`,
        status: "demo",
        message: "Demo mode — email simulated. Add RESEND_API_KEY to send real emails.",
      });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: `EventOS AI <${fromEmail}>`,
      to: [body.to],
      subject: body.subject,
      html: body.html,
    });

    if (error) {
      console.error("Resend send error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data?.id, status: "sent" });
  } catch (error) {
    console.error("Send reminder error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
