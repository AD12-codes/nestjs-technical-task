import { NotificationInfrastructureModule } from "@infrastructure/database/notification.module";
import { Module } from "@nestjs/common";
import { EventStorageService } from "./services/event-storage.service";
import { ConsecutiveDeletionChecker } from "./services/limit-checkers/consecutive-deletion.checker";
import { TopSecretReadChecker } from "./services/limit-checkers/top-secret-read.checker";
import { UserUpdateWindowChecker } from "./services/limit-checkers/user-update-window.checker";
import { LimitCheckingService } from "./services/limit-checking.service";

@Module({
  imports: [NotificationInfrastructureModule],
  providers: [
    EventStorageService,
    ConsecutiveDeletionChecker,
    TopSecretReadChecker,
    UserUpdateWindowChecker,
    LimitCheckingService,
  ],
  exports: [LimitCheckingService],
})
export class ApplicationModule {}
