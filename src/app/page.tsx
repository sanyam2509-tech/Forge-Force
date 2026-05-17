import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { WorkflowSection } from "@/components/landing/workflow-section";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span className="text-xl font-bold">EventOS AI</span>
          </Link>

          <Link href="/create">
            <Button variant="ghost">Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        Built with AI. Designed for execution.
      </footer>
    </div>
  );
}
