import { ApplicationModule } from "@application/application.module";
import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";

@Module({
  imports: [ApplicationModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
