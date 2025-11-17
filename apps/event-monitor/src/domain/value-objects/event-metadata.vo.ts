import { BaseValueObject } from "../base-value-object";
import type { EventAction, EventArea } from "../types";

interface EventMetadataProps {
  area: EventArea;
  action: EventAction;
  timestamp: Date;
  eventId?: string;
}

export class EventMetadata extends BaseValueObject<EventMetadataProps> {
  private static readonly VALID_AREAS: EventArea[] = ["user", "payment", "top-secret"];
  private static readonly VALID_ACTIONS: EventAction[] = ["create", "read", "update", "delete"];

  private constructor(props: EventMetadataProps) {
    super(props);
  }

  get area(): EventArea {
    return this.props.area;
  }

  get action(): EventAction {
    return this.props.action;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get eventId(): string | undefined {
    return this.props.eventId;
  }

  static create(props: EventMetadataProps): EventMetadata {
    EventMetadata.validate(props);
    return new EventMetadata({
      ...props,
      timestamp: new Date(props.timestamp),
    });
  }

  private static validate(props: EventMetadataProps): void {
    if (!EventMetadata.VALID_AREAS.includes(props.area)) {
      throw new Error(
        `Invalid event area: ${props.area}. Must be one of: ${EventMetadata.VALID_AREAS.join(", ")}`,
      );
    }

    if (!EventMetadata.VALID_ACTIONS.includes(props.action)) {
      throw new Error(
        `Invalid event action: ${props.action}. Must be one of: ${EventMetadata.VALID_ACTIONS.join(", ")}`,
      );
    }

    if (!props.timestamp) {
      throw new Error("Event timestamp is required");
    }

    const now = new Date();
    const timestamp = new Date(props.timestamp);
    const twoMinutesFromNow = new Date(now.getTime() + 120000);

    if (timestamp > twoMinutesFromNow) {
      throw new Error("Event timestamp cannot be in the future");
    }

    if (
      props.eventId !== undefined &&
      (typeof props.eventId !== "string" || props.eventId.trim().length === 0)
    ) {
      throw new Error("EventId must be a non-empty string if provided");
    }
  }

  getDescription(): string {
    return `${this.action} on ${this.area}`;
  }

  toJSON() {
    return {
      area: this.area,
      action: this.action,
      timestamp: this.timestamp.toISOString(),
      eventId: this.eventId,
    };
  }
}
