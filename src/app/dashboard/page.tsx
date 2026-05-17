"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Bell } from "lucide-react";
import { AppHeader } from "@/components/app-header";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { TasksTab } from "@/components/dashboard/tasks-tab";
import { TimelineTab } from "@/components/dashboard/timeline-tab";
import { CommunicationTab } from "@/components/dashboard/communication-tab";
import { SocialMediaTab } from "@/components/dashboard/social-media-tab";
import { VolunteersTab } from "@/components/dashboard/volunteers-tab";
import { RemindersTab } from "@/components/dashboard/reminders-tab";

import type { EventInput, GeneratedWorkspace, ChecklistItem } from "@/lib/types";

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
  const eventInputRef = useRef<EventInput | null>(null);

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
    try {
      const stored = localStorage.getItem("eventos-input");
      if (!stored) {
        router.push("/create");
        return;
      }
      const parsed: EventInput = JSON.parse(stored);
      eventInputRef.current = parsed;
      // Standard data-fetching-on-mount pattern
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchWorkspace(parsed);
    } catch {
      router.push("/create");
    }
  }, [router, fetchWorkspace]);

  const handleRegenerateAll = () => {
    if (eventInputRef.current) {
      fetchWorkspace(eventInputRef.current);
    }
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

          {/* Loading state */}
          {loading && (
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
          {!loading && !error && workspace && (() => {
            const eventInput = eventInputRef.current!;
            return (
              <Tabs defaultValue="overview">
                <TabsList className="bg-secondary/50 rounded-lg mb-6 w-full overflow-x-auto sm:w-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                  <TabsTrigger value="social-media">Social Media</TabsTrigger>
                  <TabsTrigger value="volunteers" className="flex items-center gap-1.5">
                    <Users className="size-3.5" /> Volunteers
                  </TabsTrigger>
                  <TabsTrigger value="reminders" className="flex items-center gap-1.5">
                    <Bell className="size-3.5" /> Reminders
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <OverviewTab
                    brief={workspace.brief}
                    onRegenerate={handleRegenerateAll}
                  />
                </TabsContent>

                <TabsContent value="tasks">
                  <TasksTab
                    checklist={workspace.checklist}
                    onToggle={handleToggleTask}
                    onUpdate={handleUpdateTask}
                    onAdd={handleAddTask}
                    onRegenerate={handleRegenerateAll}
                  />
                </TabsContent>

                <TabsContent value="timeline">
                  <TimelineTab
                    timeline={workspace.timeline}
                    onRegenerate={handleRegenerateAll}
                  />
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
            );
          })()}
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
