import type { EventInput, Volunteer, VolunteerAssignment } from "./types";

const rolesByEventType: Record<string, string[]> = {
  hackathon: ["Registration Desk", "Technical Support", "Mentor Coordination", "Photography", "Food Management", "Social Media Coverage", "Prize Distribution", "Logistics"],
  workshop: ["Speaker Coordination", "Attendee Management", "AV Setup", "Photography", "Check-in Desk", "Material Distribution", "Welcome Desk"],
  conference: ["Registration", "Session Management", "Speaker Escort", "Logistics", "Photography", "Social Media", "Information Desk"],
  meetup: ["Welcome Desk", "Setup Crew", "Photography", "Refreshments", "Program Management", "Crowd Management"],
  "social event": ["Setup", "Decoration", "Photography", "Welcome", "Entertainment Coordination", "Logistics"],
  "cultural event": ["Stage Management", "Photography", "Welcome Desk", "Logistics", "Coordination", "Decoration"],
};

const defaultRoles = ["Operations Lead", "Logistics", "Registration", "Photography", "Guest Management", "Social Media", "Tech Support"];

function getCategory(role: string): VolunteerAssignment["category"] {
  if (/Registration|Check-in|Welcome/i.test(role)) return "Guest Experience";
  if (/Technical|AV|Tech Support/i.test(role)) return "Technical";
  if (/Photography|Social Media|Content|Coverage/i.test(role)) return "Media & Content";
  if (/Food|Refreshments|Logistics|Material|Setup|Decoration/i.test(role)) return "Logistics";
  return "Core Operations";
}

function findSkillMatchRole(skills: string, roles: string[]): string | null {
  const s = skills.toLowerCase();
  // Skill-to-role hints
  if (s.includes("photo")) {
    const match = roles.find(r => /Photography/i.test(r));
    if (match) return match;
  }
  if (s.includes("tech") || s.includes("dev")) {
    const match = roles.find(r => /Technical Support|AV Setup|Tech Support/i.test(r));
    if (match) return match;
  }
  if (s.includes("social") || s.includes("media")) {
    const match = roles.find(r => /Social Media Coverage|Social Media/i.test(r));
    if (match) return match;
  }
  if (s.includes("register") || s.includes("check")) {
    const match = roles.find(r => /Registration|Check-in Desk/i.test(r));
    if (match) return match;
  }
  if (s.includes("speak") || s.includes("coord")) {
    const match = roles.find(r => /Speaker Coordination|Coordination/i.test(r));
    if (match) return match;
  }
  return null;
}

export function generateMockVolunteerAssignments(
  eventInput: EventInput,
  volunteers: Volunteer[]
): VolunteerAssignment[] {
  const n = volunteers.length;
  const roles = rolesByEventType[eventInput.eventType.toLowerCase()] ?? defaultRoles;

  // Priority thresholds
  const highCount = Math.ceil(n * 0.3);
  const mediumCount = Math.ceil(n * 0.4);

  // Track which roles have been assigned (for round-robin fallback)
  let roundRobinIndex = 0;
  const assignedRoles: string[] = [];

  const assignments: VolunteerAssignment[] = volunteers.map((v, idx) => {
    // Try skill-based match first
    let role = findSkillMatchRole(v.skills ?? "", roles) ?? null;

    // If the skill-matched role is already taken, try round-robin
    if (!role || assignedRoles.includes(role)) {
      // Round-robin through roles not yet assigned
      let attempts = 0;
      while (attempts < roles.length) {
        const candidate = roles[roundRobinIndex % roles.length];
        roundRobinIndex++;
        if (!assignedRoles.includes(candidate)) {
          role = candidate;
          break;
        }
        attempts++;
      }
      // If all roles are taken (more volunteers than roles), wrap around
      if (!role) {
        role = roles[idx % roles.length];
      }
    }

    assignedRoles.push(role!);

    // Determine priority by position index
    let priority: "high" | "medium" | "low";
    if (idx < highCount) {
      priority = "high";
    } else if (idx < highCount + mediumCount) {
      priority = "medium";
    } else {
      priority = "low";
    }

    const estimatedEffort =
      priority === "high" ? "Full day" :
      priority === "medium" ? "4-5 hours" :
      "2-3 hours";

    return {
      volunteerId: v.id,
      volunteerName: v.name,
      role: role!,
      category: getCategory(role!),
      priority,
      estimatedEffort,
      status: "assigned",
    };
  });

  return assignments;
}
