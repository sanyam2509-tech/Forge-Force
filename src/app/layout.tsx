import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventOS AI",
  description:
    "Turn event ideas into execution-ready operational workspaces. AI-powered event planning for communities, clubs, hackathons, and teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
