import type { Notification } from "@domain/entities/notification.entity";
import type {
  INotificationRepository,
  NotificationFilters,
} from "@domain/repositories/notification.repository.interface";
import { NOTIFICATION_REPOSITORY } from "@domain/repositories/notification.repository.token";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class NotificationQueryService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    return this.notificationRepository.findAll(filters);
  }
}
