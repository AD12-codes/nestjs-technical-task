import { LimitCheckingService } from "@application/services/limit-checking.service";
import type { UserEvent } from "@domain/events/user-event";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Consumer, type EachMessagePayload, Kafka } from "kafkajs";
import { EventParseError, parseUserEvent } from "../parsers/event.parser";

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly limitCheckingService: LimitCheckingService,
  ) {
    const brokers = this.configService.get<string>("KAFKA_BROKERS", "kafka:29092");
    const clientId = this.configService.get<string>("KAFKA_CLIENT_ID", "event-monitor");

    this.kafka = new Kafka({
      clientId,
      brokers: brokers.split(","),
    });

    this.consumer = this.kafka.consumer({
      groupId: `${clientId}-consumer-group`,
    });
  }

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      this.logger.log("Connecting to Kafka...");
      await this.consumer.connect();
      this.logger.log("Connected to Kafka");

      const topic = this.configService.get<string>("KAFKA_TOPIC", "user-events");
      await this.consumer.subscribe({ topic, fromBeginning: true });
      this.logger.log(`Subscribed to topic: ${topic}`);

      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.handleMessage(payload);
        },
      });

      this.logger.log("Kafka consumer started");
    } catch (error) {
      this.logger.error("Failed to connect to Kafka:", error);
      throw error;
    }
  }

  private async handleMessage(payload: EachMessagePayload) {
    const { topic, partition, message } = payload;

    try {
      if (!message.value) {
        this.logger.warn("Received empty message");
        return;
      }

      const rawEvent = JSON.parse(message.value.toString()) as UserEvent;

      this.logger.debug("Received event:", {
        topic,
        partition,
        offset: message.offset,
        key: message.key?.toString(),
        event: rawEvent,
      });

      const parsedEvent = parseUserEvent(rawEvent);

      this.logger.log("Parsed event:", {
        userId: parsedEvent.userId,
        area: parsedEvent.area,
        action: parsedEvent.action,
        timestamp: parsedEvent.timestamp.toISOString(),
      });

      await this.limitCheckingService.processEvent(parsedEvent);
    } catch (error) {
      if (error instanceof EventParseError) {
        this.logger.error("Event parsing error:", {
          message: error.message,
          event: error.event,
        });
      } else if (error instanceof SyntaxError) {
        this.logger.error("Invalid JSON:", {
          message: error.message,
          value: message.value?.toString(),
        });
      } else {
        this.logger.error("Unexpected error:", error);
      }
    }
  }

  async onModuleDestroy() {
    this.logger.log("Disconnecting from Kafka...");
    await this.consumer.disconnect();
    this.logger.log("Disconnected from Kafka");
  }
}
