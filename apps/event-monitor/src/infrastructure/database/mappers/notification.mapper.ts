import { Notification } from "@domain/entities/notification.entity";
import type { LimitType } from "@domain/types";
import { EventMetadata } from "@domain/value-objects/event-metadata.vo";
import { NotificationId } from "@domain/value-objects/notification-id.vo";
import { UserId } from "@domain/value-objects/user-id.vo";
import type {
  EventMetadataDocument,
  NotificationDocumentType,
} from "../schemas/notification.schema";

function mapEventMetadata(doc: EventMetadataDocument): EventMetadata {
  return EventMetadata.create({
    area: doc.area as "user" | "payment" | "top-secret",
    action: doc.action as "create" | "read" | "update" | "delete",
    timestamp: doc.timestamp,
    eventId: doc.eventId,
  });
}

export function notificationToPersistence(notification: Notification): Record<string, unknown> {
  return {
    _id: notification.id.toString(),
    userId: notification.userId.toString(),
    limitType: notification.limitType,
    eventMetadata: {
      area: notification.eventMetadata.area,
      action: notification.eventMetadata.action,
      timestamp: notification.eventMetadata.timestamp,
      eventId: notification.eventMetadata.eventId,
    },
    message: notification.message,
    createdAt: notification.createdAt,
  };
}

export function notificationToDomain(doc: NotificationDocumentType): Notification {
  const eventMetadata = mapEventMetadata(doc.eventMetadata);

  return Notification.reconstitute({
    id: NotificationId.from(doc._id),
    userId: UserId.create(doc.userId),
    limitType: doc.limitType as LimitType,
    eventMetadata,
    message: doc.message,
    createdAt: doc.createdAt,
  });
}
