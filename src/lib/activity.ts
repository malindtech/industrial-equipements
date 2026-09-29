import type { ActivityEvent, ActivityEntityType } from "@/types/domain";
import { generateId } from "@/lib/utils";

export function logActivity(
  activities: ActivityEvent[],
  input: {
    title: string;
    detail: string;
    entityType: ActivityEntityType;
    entityId: string;
    href: string;
  }
): ActivityEvent[] {
  const event: ActivityEvent = {
    id: generateId("act"),
    at: new Date().toISOString(),
    ...input,
  };
  return [event, ...activities].slice(0, 200);
}
