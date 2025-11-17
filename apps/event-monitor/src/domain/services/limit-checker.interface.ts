import type { Notification } from "../entities/notification.entity";
import type { ParsedEvent } from "../events/user-event";

export interface ILimitChecker {
  check(event: ParsedEvent): Promise<Notification | null>;
  getName(): string;
}
