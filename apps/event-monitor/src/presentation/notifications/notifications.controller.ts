import { NotificationQueryService } from "@application/services/notification-query.service";
import type { LimitType } from "@domain/types";
import { Controller, Get, Query } from "@nestjs/common";

interface NotificationResponseDto {
  id: string;
  userId: string;
  limitType: LimitType;
  message: string;
  eventMetadata: {
    area: string;
    action: string;
    timestamp: string;
    eventId?: string;
  };
  createdAt: string;
}

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationQueryService: NotificationQueryService) {}

  @Get()
  async getNotifications(
    @Query("userId") userId?: string,
    @Query("limitType") limitType?: LimitType,
  ): Promise<NotificationResponseDto[]> {
    const filters = {
      ...(userId && { userId }),
      ...(limitType && { limitType }),
    };

    const notifications = await this.notificationQueryService.getNotifications(filters);

    return notifications.map((notification) => ({
      id: notification.id.toString(),
      userId: notification.userId.toString(),
      limitType: notification.limitType,
      message: notification.message,
      eventMetadata: {
        area: notification.eventMetadata.area,
        action: notification.eventMetadata.action,
        timestamp: notification.eventMetadata.timestamp.toISOString(),
        eventId: notification.eventMetadata.eventId,
      },
      createdAt: notification.createdAt.toISOString(),
    }));
  }
}
