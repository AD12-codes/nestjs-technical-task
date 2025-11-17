import { Notification } from "@domain/entities/notification.entity";
import type { ParsedEvent } from "@domain/events/user-event";
import type { ILimitChecker } from "@domain/services/limit-checker.interface";
import { LimitType } from "@domain/types";
import { EventMetadata } from "@domain/value-objects/event-metadata.vo";
import { UserId } from "@domain/value-objects/user-id.vo";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TopSecretReadChecker implements ILimitChecker {
  getName(): string {
    return "TopSecretReadChecker";
  }

  async check(event: ParsedEvent): Promise<Notification | null> {
    if (event.area !== "top-secret" || event.action !== "read") {
      return null;
    }

    return Notification.create({
      userId: UserId.create(event.userId),
      limitType: LimitType.TOP_SECRET_READ,
      eventMetadata: EventMetadata.create({
        area: event.area,
        action: event.action,
        timestamp: event.timestamp,
      }),
      message: `User ${event.userId} accessed top-secret resource`,
    });
  }
}
