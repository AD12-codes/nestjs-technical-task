import type { ParsedEvent, UserEvent } from "@domain/events/user-event";

export class EventParseError extends Error {
  constructor(
    message: string,
    public readonly event?: unknown,
  ) {
    super(message);
    this.name = "EventParseError";
  }
}

export function parseUserEvent(event: UserEvent): ParsedEvent {
  if (!event.userId || typeof event.userId !== "number") {
    throw new EventParseError("Invalid userId", event);
  }

  if (!event.scope || typeof event.scope !== "string") {
    throw new EventParseError("Invalid scope", event);
  }

  if (!event.date || typeof event.date !== "string") {
    throw new EventParseError("Invalid date", event);
  }

  const [area, action] = event.scope.split(".");

  if (!area || !action) {
    throw new EventParseError(`Invalid scope format: ${event.scope}`, event);
  }

  const validAreas = ["user", "payment", "top-secret"];
  if (!validAreas.includes(area)) {
    throw new EventParseError(`Invalid area: ${area}`, event);
  }

  const validActions = ["create", "read", "update", "delete"];
  if (!validActions.includes(action)) {
    throw new EventParseError(`Invalid action: ${action}`, event);
  }

  const timestamp = new Date(event.date);
  if (Number.isNaN(timestamp.getTime())) {
    throw new EventParseError(`Invalid date format: ${event.date}`, event);
  }

  return {
    userId: event.userId.toString(),
    area: area as ParsedEvent["area"],
    action: action as ParsedEvent["action"],
    timestamp,
  };
}
