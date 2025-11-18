import configuration from "@infrastructure/config/configuration";
import { KafkaModule } from "@infrastructure/kafka/kafka.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "@presentation/health.module";
import { NotificationsModule } from "@presentation/notifications/notifications.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    KafkaModule,
    HealthModule,
    NotificationsModule,
  ],
})
export class AppModule {}
