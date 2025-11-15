import { randomInt } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { styleText } from "node:util";
import { Kafka, Partitioners } from "kafkajs";

const RESOURCES = ["user", "payment", "top-secret"] as const;
const ACTIONS = ["create", "read", "update", "delete"] as const;

runProducer();

async function runProducer() {
  const brokers = process.env.KAFKA_BROKERS?.split(",") ?? [];

  if (brokers.length === 0) {
    console.error(`⚠️  ${styleText("red", "Error!")}`);
    console.error("You must provide at least a broker to run this script.");
    console.error("Examples:");
    console.error("\t- KAFKA_BROKERS=127.0.0.1:9092 npm run test-producer");
    console.error("\t- KAFKA_BROKERS=broker1:9092,broker2:9092 npm run test-producer");

    process.exit(1);
  }

  const producer = new Kafka({
    clientId: "test-producer",
    brokers,
  }).producer({
    allowAutoTopicCreation: true,
    createPartitioner: Partitioners.DefaultPartitioner,
  });

  await producer.connect();

  for (;;) {
    const resource = RESOURCES.at(randomInt(0, RESOURCES.length));
    const action = ACTIONS.at(randomInt(0, ACTIONS.length));

    const message = {
      userId: randomInt(1, 101),
      scope: `${resource}.${action}`,
      date: new Date(),
    };

    console.log("Publishing message:", message);

    await producer.send({
      topic: "test.events.system",
      messages: [
        {
          value: JSON.stringify(message),
          timestamp: message.date.getTime().toString(),
        },
      ],
    });

    // Delay between messages
    await setTimeout(randomInt(10, 500));
  }
}
