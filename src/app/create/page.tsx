import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/create/event-form";

export default function CreatePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span className="text-xl font-bold">EventOS AI</span>
          </Link>

          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Create Your Event Workspace</h1>
            <p className="text-muted-foreground">
              Fill in the details and let AI generate your complete operational
              plan.
            </p>
          </div>

          <EventForm />
        </div>
      </main>
    </div>
  );
}
