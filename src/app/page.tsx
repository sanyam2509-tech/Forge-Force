import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { WorkflowSection } from "@/components/landing/workflow-section";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader>
        <Link href="/create">
          <Button variant="ghost">Get Started</Button>
        </Link>
      </AppHeader>

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
