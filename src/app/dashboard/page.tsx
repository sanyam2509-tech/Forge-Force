"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Brain,
  ClipboardList,
  Gauge,
  ListChecks,
  Megaphone,
  Radio,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { TasksTab } from "@/components/dashboard/tasks-tab";
import { TimelineTab } from "@/components/dashboard/timeline-tab";
import { CommunicationTab } from "@/components/dashboard/communication-tab";
import { SocialMediaTab } from "@/components/dashboard/social-media-tab";
import { VolunteersTab } from "@/components/dashboard/volunteers-tab";
import { RemindersTab } from "@/components/dashboard/reminders-tab";
import { CommandCenterTab } from "@/components/dashboard/command-center-tab";
import { TeamWorkspaceTab } from "@/components/dashboard/team-workspace-tab";
import { RunOfShowTab } from "@/components/dashboard/run-of-show-tab";
import { ExecutionTrackerTab } from "@/components/dashboard/execution-tracker-tab";
import { EventScheduleTab } from "@/components/dashboard/event-schedule-tab";
import { DocumentHubTab } from "@/components/dashboard/document-hub-tab";

import type { EventInput, GeneratedWorkspace, ChecklistItem } from "@/lib/types";

type RoleMode = "organizer" | "operations" | "marketing" | "volunteer";
type DashboardTab =
  | "command-center"
  | "overview"
  | "tasks"
  | "execution"
  | "schedule"
  | "documents"
  | "timeline"
  | "communication"
  | "social-media"
  | "team"
  | "run-of-show"
  | "volunteers"
  | "reminders";

const roleModes: Record<
  RoleMode,
  {
    label: string;
    description: string;
    icon: typeof Gauge;
    defaultTab: DashboardTab;
    tabs: DashboardTab[];
  }
> = {
  organizer: {
    label: "Organizer View",
    description: "Health, risks, ownership, and executive readiness",
    icon: Gauge,
    defaultTab: "command-center",
    tabs: ["command-center", "execution", "schedule", "documents", "overview", "team", "run-of-show", "tasks", "reminders"],
  },
  operations: {
    label: "Operations View",
    description: "Execution owners, timeline pressure, and logistics",
    icon: ClipboardList,
    defaultTab: "team",
    tabs: ["execution", "schedule", "documents", "team", "run-of-show", "tasks", "timeline", "volunteers", "command-center"],
  },
  marketing: {
    label: "Marketing View",
    description: "Promotion readiness, comms, and campaign execution",
    icon: Megaphone,
    defaultTab: "social-media",
    tabs: ["social-media", "communication", "schedule", "documents", "team", "command-center"],
  },
  volunteer: {
    label: "Volunteer View",
    description: "Assigned responsibilities, deadlines, and support flow",
    icon: UserRound,
    defaultTab: "team",
    tabs: ["execution", "schedule", "team", "run-of-show", "tasks", "timeline", "communication"],
  },
};

function DashboardSkeleton() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header skeleton */}
          <div className="border-b border-border/50 pb-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-8 w-36" />
            </div>
          </div>

          {/* Tab bar skeleton */}
          <Skeleton className="h-8 w-full max-w-lg mb-6 rounded-lg" />

          {/* Content skeleton */}
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Generating your workspace...
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [workspace, setWorkspace] = useState<GeneratedWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleMode, setRoleMode] = useState<RoleMode>("organizer");
  const [activeTab, setActiveTab] = useState<DashboardTab>("command-center");
  // Incrementing this counter triggers a workspace re-fetch (used by Regenerate All).
  const [fetchCount, setFetchCount] = useState(0);

  // Read the stored event input once at mount time using a lazy initializer so
  // it is available synchronously without reading a ref during render.
  const [eventInput] = useState<EventInput | null>(() => {
    try {
      const stored = localStorage.getItem("eventos-input");
      if (!stored) return null;
      return JSON.parse(stored) as EventInput;
    } catch {
      return null;
    }
  });

  const title = searchParams.get("title") ?? "Untitled Event";
  const eventType = searchParams.get("type") ?? "Event";

  const fetchWorkspace = useCallback(
    async (input: EventInput) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error("Failed to generate workspace. Please try again.");
        }

        const data: GeneratedWorkspace = await response.json();
        setWorkspace(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!eventInput) {
      router.push("/create");
    }
  }, [router, eventInput]);

  useEffect(() => {
    if (!eventInput) return;
    // fetchWorkspace is an async data-fetch that updates state in its callbacks;
    // calling it here is the standard on-mount data-fetching pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchWorkspace(eventInput);
  // fetchCount in deps re-runs this effect when Regenerate All is clicked.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCount]);

  const handleRegenerateAll = () => {
    setFetchCount((n) => n + 1);
  };

  const handleToggleTask = (id: string) => {
    if (!workspace) return;
    setWorkspace({
      ...workspace,
      checklist: workspace.checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    });
  };

  const handleUpdateTask = (id: string, updates: Partial<ChecklistItem>) => {
    setWorkspace((prev) =>
      prev
        ? {
            ...prev,
            checklist: prev.checklist.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          }
        : null
    );
  };

  const handleAddTask = (task: Omit<ChecklistItem, "id">) => {
    setWorkspace((prev) =>
      prev
        ? {
            ...prev,
            checklist: [
              ...prev.checklist,
              { id: `custom-${Date.now()}`, ...task },
            ],
          }
        : null
    );
  };

  const activeMode = roleModes[roleMode];
  const showTab = (tab: DashboardTab) => activeMode.tabs.includes(tab);

  const handleRoleModeChange = (mode: RoleMode) => {
    setRoleMode(mode);
    setActiveTab(roleModes[mode].defaultTab);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader>
        <Link href="/create">
          <Button variant="ghost" size="sm">
            New Event
          </Button>
        </Link>
      </AppHeader>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <DashboardHeader
            title={title}
            eventType={eventType}
            onRegenerateAll={handleRegenerateAll}
            isRegenerating={loading}
          />

          {loading && (
            <div className="space-y-5">
              <Card className="border-primary/20 bg-card/90">
                <CardContent className="py-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm text-primary">
                        <Sparkles className="size-3.5 animate-pulse" />
                        EventOS agent running
                      </div>
                      <h2 className="text-2xl font-semibold">
                        Building operational intelligence
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Analyzing urgency, event scale, risk profile,
                        volunteer coverage, communication cadence, and
                        marketing strategy.
                      </p>
                    </div>
                    <div className="grid min-w-72 gap-2 text-sm">
                      {([
                        ["Analyzing event complexity", Brain],
                        ["Sequencing operations timeline", Gauge],
                        ["Preparing communication flow", Radio],
                      ] as const).map(([label, Icon]) => (
                        <div
                          key={label}
                          className="flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/35 px-3 py-2"
                        >
                          <Icon className="size-4 text-primary" />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-56 rounded-xl" />
                <Skeleton className="h-56 rounded-xl" />
              </div>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <Card className="border-red-500/20">
              <CardContent className="flex flex-col items-center gap-4 py-8">
                <div className="text-center">
                  <p className="text-lg font-semibold text-red-400">
                    Something went wrong
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" onClick={handleRegenerateAll}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Success state */}
          {!loading && !error && workspace && eventInput && (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)}>
              <div className="mb-5 grid gap-3 lg:grid-cols-4">
                {(Object.entries(roleModes) as [RoleMode, typeof roleModes[RoleMode]][]).map(
                  ([mode, config]) => {
                    const Icon = config.icon;
                    const active = mode === roleMode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleRoleModeChange(mode)}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          active
                            ? "border-primary/40 bg-primary/10 shadow-[0_18px_80px_-55px_oklch(0.72_0.16_190/0.9)]"
                            : "border-border/60 bg-card/55 hover:border-primary/25"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <Icon className="size-4 text-primary" />
                          {active && (
                            <Badge variant="outline" className="border-primary/30 text-primary">
                              active
                            </Badge>
                          )}
                        </div>
                        <p className="mt-3 text-sm font-semibold">{config.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {config.description}
                        </p>
                      </button>
                    );
                  }
                )}
              </div>

              <TabsList className="mb-6 w-full overflow-x-auto rounded-xl border border-border/60 bg-card/75 p-1 shadow-2xl shadow-black/20 backdrop-blur sm:w-auto">
                {showTab("command-center") && (
                  <TabsTrigger value="command-center" className="flex items-center gap-1.5">
                    <Gauge className="size-3.5" /> Command
                  </TabsTrigger>
                )}
                {showTab("overview") && (
                  <TabsTrigger value="overview">Event Overview</TabsTrigger>
                )}
                {showTab("team") && (
                  <TabsTrigger value="team" className="flex items-center gap-1.5">
                    <Users className="size-3.5" /> Team Workspace
                  </TabsTrigger>
                )}
                {showTab("execution") && (
                  <TabsTrigger value="execution" className="flex items-center gap-1.5">
                    <ListChecks className="size-3.5" /> Execution
                  </TabsTrigger>
                )}
                {showTab("schedule") && (
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                )}
                {showTab("documents") && (
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                )}
                {showTab("tasks") && (
                  <TabsTrigger value="tasks">Operations</TabsTrigger>
                )}
                {showTab("run-of-show") && (
                  <TabsTrigger value="run-of-show">Run of Show</TabsTrigger>
                )}
                {showTab("timeline") && (
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                )}
                {showTab("communication") && (
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                )}
                {showTab("social-media") && (
                  <TabsTrigger value="social-media">Marketing</TabsTrigger>
                )}
                {showTab("volunteers") && (
                  <TabsTrigger value="volunteers" className="flex items-center gap-1.5">
                    <Users className="size-3.5" /> Volunteers
                  </TabsTrigger>
                )}
                {showTab("reminders") && (
                  <TabsTrigger value="reminders" className="flex items-center gap-1.5">
                    <Bell className="size-3.5" /> Reminders
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="command-center">
                <CommandCenterTab workspace={workspace} eventInput={eventInput} />
              </TabsContent>

              <TabsContent value="overview">
                <OverviewTab
                  brief={workspace.brief}
                  onRegenerate={handleRegenerateAll}
                />
              </TabsContent>

              <TabsContent value="team">
                <TeamWorkspaceTab
                  workspace={workspace}
                  eventInput={eventInput}
                  roleMode={roleMode}
                />
              </TabsContent>

              <TabsContent value="execution">
                <ExecutionTrackerTab
                  workspace={workspace}
                  eventInput={eventInput}
                />
              </TabsContent>

              <TabsContent value="schedule">
                <EventScheduleTab eventInput={eventInput} />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentHubTab eventInput={eventInput} />
              </TabsContent>

              <TabsContent value="tasks">
                <TasksTab
                  checklist={workspace.checklist}
                  eventInput={eventInput}
                  onToggle={handleToggleTask}
                  onUpdate={handleUpdateTask}
                  onAdd={handleAddTask}
                  onRegenerate={handleRegenerateAll}
                />
              </TabsContent>

              <TabsContent value="timeline">
                <TimelineTab
                  timeline={workspace.timeline}
                  eventInput={eventInput}
                  onRegenerate={handleRegenerateAll}
                />
              </TabsContent>

              <TabsContent value="run-of-show">
                <RunOfShowTab workspace={workspace} eventInput={eventInput} />
              </TabsContent>

              <TabsContent value="communication">
                <CommunicationTab
                  communication={workspace.communication}
                  eventInput={eventInput}
                  onRegenerate={handleRegenerateAll}
                />
              </TabsContent>

              <TabsContent value="social-media">
                <SocialMediaTab
                  socialMedia={workspace.socialMedia}
                  onRegenerate={handleRegenerateAll}
                />
              </TabsContent>

              <TabsContent value="volunteers">
                <VolunteersTab eventInput={eventInput} />
              </TabsContent>

              <TabsContent value="reminders">
                <RemindersTab eventInput={eventInput} communication={workspace.communication} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
