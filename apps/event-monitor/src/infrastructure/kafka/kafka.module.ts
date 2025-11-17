import { ApplicationModule } from "@application/application.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { KafkaConsumerService } from "./services/kafka-consumer.service";

@Module({
  imports: [ConfigModule, ApplicationModule],
  providers: [KafkaConsumerService],
  exports: [KafkaConsumerService],
})
export class KafkaModule {}
