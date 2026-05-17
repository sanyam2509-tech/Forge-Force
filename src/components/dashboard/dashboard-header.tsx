import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  title: string;
  eventType: string;
  onRegenerateAll: () => void;
  isRegenerating: boolean;
}

export function DashboardHeader({
  title,
  eventType,
  onRegenerateAll,
  isRegenerating,
}: DashboardHeaderProps) {
  return (
    <div className="border-b border-border/50 pb-6 mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side */}
        <div className="flex items-start gap-4">
          <Link
            href="/create"
            className="mt-1 flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{title}</h1>
              <Badge variant="secondary">{eventType}</Badge>
            </div>
          </div>
        </div>

        {/* Right side */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerateAll}
          disabled={isRegenerating}
        >
          <RefreshCw
            className={`size-4 mr-1.5 ${isRegenerating ? "animate-spin" : ""}`}
          />
          {isRegenerating ? "Regenerating..." : "Regenerate All"}
        </Button>
      </div>
    </div>
  );
}
