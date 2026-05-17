"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { ChecklistItem, EventInput, GeneratedWorkspace } from "@/lib/types";

type RoleMode = "organizer" | "operations" | "marketing" | "volunteer";

interface TeamWorkspaceTabProps {
  workspace: GeneratedWorkspace;
  eventInput: EventInput;
  roleMode: RoleMode;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  responsibility: string;
  color: string;
}

const colors = [
  "bg-cyan-400",
  "bg-fuchsia-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-blue-400",
  "bg-rose-400",
  "bg-violet-400",
  "bg-lime-400",
];

const roleByIndex = [
  ["Event Lead", "Command, decisions, escalation"],
  ["Operations Lead", "Venue, AV, Wi-Fi, run-of-show"],
  ["Marketing Lead", "Launch campaign, social proof, content"],
  ["Volunteer Lead", "Briefing, role coverage, attendee support"],
  ["Registration Lead", "Check-in, badges, queue flow"],
  ["Media Lead", "Stories, reels, recap assets"],
  ["Technical Lead", "Demos, equipment, support desk"],
  ["Logistics Runner", "Supplies, signage, rapid fixes"],
];

function parseNames(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return [];

  const count = Number(trimmed);
  if (Number.isInteger(count) && count > 0) {
    return Array.from({ length: Math.min(count, 16) }, (_, index) => {
      return `Volunteer ${index + 1}`;
    });
  }

  return trimmed
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 16);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function taskMatchesMember(task: ChecklistItem, member: TeamMember) {
  const haystack = normalize(
    `${task.owner ?? ""} ${task.category} ${task.task}`
  );
  const role = normalize(`${member.role} ${member.responsibility}`);
  const name = normalize(member.name);
  return (
    haystack.includes(name) ||
    role.split(" ").some((token) => token.length > 4 && haystack.includes(token))
  );
}

function buildInitialMembers(input: EventInput, tasks: ChecklistItem[]) {
  const volunteerNames = parseNames(input.volunteerNames);
  const ownerNames = tasks
    .map((task) => task.owner)
    .filter((owner): owner is string => Boolean(owner))
    .filter((owner) => !/team|lead|coordinator|manager/i.test(owner))
    .slice(0, 6);
  const names = Array.from(new Set([...volunteerNames, ...ownerNames]));

  const fallbackNames = names.length > 0 ? names : ["Organizer", "Ops Lead", "Marketing Lead"];

  return fallbackNames.slice(0, 12).map((name, index) => {
    const [role, responsibility] = roleByIndex[index % roleByIndex.length];
    return {
      id: `member-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      role,
      responsibility,
      color: colors[index % colors.length],
    };
  });
}

function assignTasks(tasks: ChecklistItem[], members: TeamMember[]) {
  const assignments = new Map<string, ChecklistItem[]>();
  members.forEach((member) => assignments.set(member.id, []));

  tasks.forEach((task, index) => {
    const matched = members.find((member) => taskMatchesMember(task, member));
    const owner = matched ?? members[index % Math.max(members.length, 1)];
    if (!owner) return;
    assignments.get(owner.id)?.push(task);
  });

  return assignments;
}

export function TeamWorkspaceTab({
  workspace,
  eventInput,
  roleMode,
}: TeamWorkspaceTabProps) {
  const initialMembers = useMemo(
    () => buildInitialMembers(eventInput, workspace.checklist),
    [eventInput, workspace.checklist]
  );
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [newName, setNewName] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");

  const assignments = useMemo(
    () => assignTasks(workspace.checklist, members),
    [workspace.checklist, members]
  );

  const visibleMembers =
    roleMode === "marketing"
      ? members.filter((member) => /market|media|social|content/i.test(`${member.role} ${member.responsibility}`))
      : roleMode === "operations"
        ? members.filter((member) => /ops|operation|logistics|technical|registration|event/i.test(`${member.role} ${member.responsibility}`))
        : members;

  const memberLoads = members.map((member) => {
    const tasks = assignments.get(member.id) ?? [];
    const critical = tasks.filter((task) => task.priority === "high").length;
    return { member, tasks, critical };
  });

  const maxLoad = Math.max(1, ...memberLoads.map((load) => load.tasks.length));
  const overloaded = memberLoads.filter(
    (load) => load.tasks.length >= Math.max(4, maxLoad - 1) && load.critical >= 2
  );
  const unownedCritical = workspace.checklist.filter(
    (task) => task.priority === "high" && !task.owner
  );
  const hasMarketingOwner = members.some((member) =>
    /market|media|social|content/i.test(`${member.role} ${member.responsibility}`)
  );
  const hasTechOwner = members.some((member) =>
    /technical|av|wi-fi|wifi|demo|equipment/i.test(`${member.role} ${member.responsibility}`)
  );
  const needsTech = /hackathon|workshop|conference|demo|tech/i.test(
    `${eventInput.eventType} ${eventInput.title}`
  );
  const loadSpread =
    Math.max(...memberLoads.map((load) => load.tasks.length)) -
    Math.min(...memberLoads.map((load) => load.tasks.length));

  const insights = [
    ...(overloaded.length > 0
      ? overloaded.map((load) => {
          return `${load.member.name} is carrying ${load.tasks.length} tasks including ${load.critical} critical items. Rebalance before execution.`;
        })
      : ["Volunteer response load is balanced enough for the current plan."]),
    ...(unownedCritical.length > 0
      ? [`${unownedCritical.length} critical task${unownedCritical.length !== 1 ? "s" : ""} still lack named ownership.`]
      : ["Critical responsibilities have simulated owners assigned."]),
    ...(!hasMarketingOwner
      ? ["Marketing coordination risk detected. Add a content or campaign owner."]
      : ["Marketing workflow has a visible owner for campaign execution."]),
    ...(needsTech && !hasTechOwner
      ? ["Technical setup ownership unclear. Assign AV, Wi-Fi, demo, and equipment support."]
      : ["Technical and operations coverage looks represented."]),
    ...(loadSpread >= 4
      ? ["Uneven workload distribution detected across the team."]
      : ["Workload distribution is within a healthy range."]),
  ];

  const addMember = () => {
    if (!newName.trim()) return;
    const index = members.length;
    setMembers((prev) => [
      ...prev,
      {
        id: `member-custom-${Date.now()}`,
        name: newName.trim(),
        role: "Team Member",
        responsibility: newResponsibility.trim() || "General event support",
        color: colors[index % colors.length],
      },
    ]);
    setNewName("");
    setNewResponsibility("");
  };

  return (
    <div className="space-y-5">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Users className="size-5 text-primary" />
            Team Workspace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <Input
              placeholder="Add teammate or volunteer"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addMember();
              }}
            />
            <Input
              placeholder="Responsibility, e.g. Check-in lead"
              value={newResponsibility}
              onChange={(event) => setNewResponsibility(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addMember();
              }}
            />
            <Button onClick={addMember} disabled={!newName.trim()}>
              <Plus className="mr-2 size-3.5" />
              Add
            </Button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {visibleMembers.map((member) => {
              const tasks = assignments.get(member.id) ?? [];
              const critical = tasks.filter((task) => task.priority === "high").length;
              const load = Math.round((tasks.length / maxLoad) * 100);
              return (
                <div
                  key={member.id}
                  className="rounded-xl border border-border/60 bg-secondary/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 items-center justify-center rounded-full text-sm font-bold text-background ${member.color}`}
                      >
                        {initials(member.name) || <UserRound className="size-4" />}
                      </div>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        critical > 2
                          ? "border-red-500/30 text-red-300"
                          : "border-primary/30 text-primary"
                      }
                    >
                      {tasks.length} tasks
                    </Badge>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {member.responsibility}
                  </p>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Workload pressure</span>
                      <span>{load}%</span>
                    </div>
                    <Progress value={load} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tasks.slice(0, 3).map((task) => (
                      <Badge
                        key={task.id}
                        variant="secondary"
                        className="max-w-full justify-start truncate"
                      >
                        {task.category}
                      </Badge>
                    ))}
                    {critical > 0 && (
                      <Badge variant="outline" className="border-red-500/30 text-red-300">
                        {critical} critical
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="size-5 text-primary" />
              Team Coordination Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight) => {
                const alert = /risk|unclear|overloaded|lack|uneven|rebalance/i.test(
                  insight
                );
                return (
                  <div
                    key={insight}
                    className="flex gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3"
                  >
                    {alert ? (
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-300" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-300" />
                    )}
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {insight}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Ownership Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workspace.checklist
                .filter((task) => task.priority === "high")
                .slice(0, 5)
                .map((task, index) => {
                  const owner = memberLoads[index % memberLoads.length]?.member;
                  return (
                    <div
                      key={task.id}
                      className="rounded-lg border border-border/50 bg-secondary/30 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{task.category}</p>
                        <Badge variant="outline" className="border-red-500/30 text-red-300">
                          critical
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {task.task}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={`size-2 rounded-full ${owner?.color ?? "bg-muted"}`}
                        />
                        Simulated owner: {owner?.name ?? "Unassigned"}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
