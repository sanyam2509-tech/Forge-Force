import type { GeneratedWorkspace } from "./types";

export function validateWorkspace(data: unknown): data is GeneratedWorkspace {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;

  // Validate brief
  if (!d.brief || typeof d.brief !== "object") return false;
  const brief = d.brief as Record<string, unknown>;
  if (typeof brief.summary !== "string") return false;
  if (!Array.isArray(brief.objectives)) return false;
  if (typeof brief.audience !== "string") return false;
  if (!Array.isArray(brief.executionGoals)) return false;

  // Validate checklist
  if (!Array.isArray(d.checklist) || d.checklist.length === 0) return false;

  // Validate timeline
  if (!Array.isArray(d.timeline) || d.timeline.length === 0) return false;

  // Validate communication
  if (!Array.isArray(d.communication) || d.communication.length === 0)
    return false;

  // Validate socialMedia
  if (!Array.isArray(d.socialMedia) || d.socialMedia.length === 0) return false;

  return true;
}
