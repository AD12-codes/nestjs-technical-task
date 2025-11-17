import { Notification } from "@domain/entities/notification.entity";
import type { ParsedEvent } from "@domain/events/user-event";
import type { ILimitChecker } from "@domain/services/limit-checker.interface";
import { LimitType } from "@domain/types";
import { EventMetadata } from "@domain/value-objects/event-metadata.vo";
import { UserId } from "@domain/value-objects/user-id.vo";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventStorageService } from "../event-storage.service";

@Injectable()
export class ConsecutiveDeletionChecker implements ILimitChecker {
  private readonly REQUIRED_DELETIONS: number;

  constructor(
    private readonly eventStorage: EventStorageService,
    private readonly configService: ConfigService,
  ) {
    this.REQUIRED_DELETIONS = Number(this.configService.get("LIMIT_CONSECUTIVE_DELETIONS", 3));
  }

  getName(): string {
    return "ConsecutiveDeletionChecker";
  }

  async check(event: ParsedEvent): Promise<Notification | null> {
    if (event.area !== "user" || event.action !== "delete") {
      return null;
    }

    const recentEvents = this.eventStorage.getRecentUserEvents(
      event.userId,
      this.REQUIRED_DELETIONS,
    );

    const allDeletions = recentEvents.every((e) => e.area === "user" && e.action === "delete");

    if (recentEvents.length === this.REQUIRED_DELETIONS && allDeletions) {
      return Notification.create({
        userId: UserId.create(event.userId),
        limitType: LimitType.THREE_USER_DELETIONS,
        eventMetadata: EventMetadata.create({
          area: event.area,
          action: event.action,
          timestamp: event.timestamp,
        }),
        message: `User ${event.userId} deleted ${this.REQUIRED_DELETIONS} resources consecutively`,
      });
    }

    return null;
  }
}
