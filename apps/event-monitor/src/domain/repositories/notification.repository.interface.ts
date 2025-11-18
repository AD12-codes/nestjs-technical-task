import type { Notification } from "../entities/notification.entity";
import type { LimitType } from "../types";

export interface NotificationFilters {
  userId?: string;
  limitType?: LimitType;
}

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  findAll(filters?: NotificationFilters): Promise<Notification[]>;
}
