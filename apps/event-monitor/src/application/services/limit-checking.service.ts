import type { ParsedEvent } from "@domain/events/user-event";
import type { INotificationRepository } from "@domain/repositories/notification.repository.interface";
import { NOTIFICATION_REPOSITORY } from "@domain/repositories/notification.repository.token";
import type { ILimitChecker } from "@domain/services/limit-checker.interface";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { EventStorageService } from "./event-storage.service";
import { ConsecutiveDeletionChecker } from "./limit-checkers/consecutive-deletion.checker";
import { TopSecretReadChecker } from "./limit-checkers/top-secret-read.checker";
import { UserUpdateWindowChecker } from "./limit-checkers/user-update-window.checker";

@Injectable()
export class LimitCheckingService {
  private readonly logger = new Logger(LimitCheckingService.name);
  private readonly checkers: ILimitChecker[];

  constructor(
    private readonly eventStorage: EventStorageService,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    consecutiveDeletionChecker: ConsecutiveDeletionChecker,
    topSecretReadChecker: TopSecretReadChecker,
    userUpdateWindowChecker: UserUpdateWindowChecker,
  ) {
    this.checkers = [consecutiveDeletionChecker, topSecretReadChecker, userUpdateWindowChecker];
  }

  async processEvent(event: ParsedEvent): Promise<void> {
    this.eventStorage.addEvent(event);

    this.logger.debug(`Processing event for user ${event.userId}`, {
      area: event.area,
      action: event.action,
    });

    for (const checker of this.checkers) {
      try {
        const notification = await checker.check(event);

        if (notification) {
          this.logger.warn(`Limit exceeded: ${checker.getName()}`, {
            userId: event.userId,
            limitType: notification.limitType,
            message: notification.message,
          });

          await this.notificationRepository.save(notification);

          this.logger.log(`Notification saved: ${notification.id.toString()}`);
        }
      } catch (error) {
        this.logger.error(`Error in ${checker.getName()}:`, error);
      }
    }
  }
}
