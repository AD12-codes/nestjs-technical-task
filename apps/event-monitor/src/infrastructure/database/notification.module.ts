import { NOTIFICATION_REPOSITORY } from "@domain/repositories/notification.repository.token";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoNotificationRepository } from "./repositories/mongo-notification.repository";
import { NotificationDocument, NotificationSchema } from "./schemas/notification.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: NotificationDocument.name, schema: NotificationSchema }]),
  ],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: MongoNotificationRepository,
    },
  ],
  exports: [NOTIFICATION_REPOSITORY],
})
export class NotificationInfrastructureModule {}
