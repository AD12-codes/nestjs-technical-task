import type { Notification } from "@domain/entities/notification.entity";
import type { INotificationRepository } from "@domain/repositories/notification.repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { notificationToPersistence } from "../mappers/notification.mapper";
import {
  NotificationDocument,
  type NotificationDocumentType,
} from "../schemas/notification.schema";

@Injectable()
export class MongoNotificationRepository implements INotificationRepository {
  constructor(
    @InjectModel(NotificationDocument.name)
    private readonly notificationModel: Model<NotificationDocumentType>,
  ) {}

  async save(notification: Notification): Promise<void> {
    const doc = notificationToPersistence(notification);

    await this.notificationModel.updateOne({ _id: doc._id }, doc, { upsert: true });
  }
}
