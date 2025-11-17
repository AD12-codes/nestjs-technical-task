import type { Notification } from "../entities/notification.entity";

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
}
