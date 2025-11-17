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
export class UserUpdateWindowChecker implements ILimitChecker {
  private readonly WINDOW_MS: number;
  private readonly REQUIRED_UPDATES: number;

  constructor(
    private readonly eventStorage: EventStorageService,
    private readonly configService: ConfigService,
  ) {
    const windowMinutes = Number(this.configService.get("LIMIT_UPDATE_WINDOW_MINUTES", 1));
    this.WINDOW_MS = windowMinutes * 60 * 1000;
    this.REQUIRED_UPDATES = Number(this.configService.get("LIMIT_UPDATE_WINDOW_COUNT", 2));
  }

  getName(): string {
    return "UserUpdateWindowChecker";
  }

  async check(event: ParsedEvent): Promise<Notification | null> {
    if (event.area !== "user" || event.action !== "update") {
      return null;
    }

    const eventsInWindow = this.eventStorage.getEventsInTimeWindow(
      event.userId,
      this.WINDOW_MS,
      event.timestamp,
    );

    const updateEvents = eventsInWindow.filter((e) => e.area === "user" && e.action === "update");

    if (updateEvents.length >= this.REQUIRED_UPDATES) {
      return Notification.create({
        userId: UserId.create(event.userId),
        limitType: LimitType.TWO_USER_UPDATES_IN_ONE_MINUTE,
        eventMetadata: EventMetadata.create({
          area: event.area,
          action: event.action,
          timestamp: event.timestamp,
        }),
        message: `User ${event.userId} updated ${updateEvents.length} users within 1 minute`,
      });
    }

    return null;
  }
}
