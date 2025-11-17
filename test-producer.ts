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

  const MESSAGE_COUNT = 1000;
  const USER_ID_MIN = 4000;
  const USER_ID_MAX = 5000;

  console.log(`\n Load Test Configuration:`);
  console.log(`   - Messages: ${MESSAGE_COUNT}`);
  console.log(`   - User ID Range: ${USER_ID_MIN}-${USER_ID_MAX}`);
  console.log(`   - Topic: user-events`);
  console.log(
    `\nThis range (4000-5000) differentiates load test data from deterministic tests (users 1-100).\n`,
  );

  for (let i = 0; i < MESSAGE_COUNT; i++) {
    const resource = RESOURCES.at(randomInt(0, RESOURCES.length));
    const action = ACTIONS.at(randomInt(0, ACTIONS.length));

    const message = {
      userId: randomInt(USER_ID_MIN, USER_ID_MAX + 1),
      scope: `${resource}.${action}`,
      date: new Date(),
    };

    if (i % 100 === 0) {
      console.log(`Progress: ${i}/${MESSAGE_COUNT} messages sent...`);
    }

    await producer.send({
      topic: "user-events",
      messages: [
        {
          value: JSON.stringify(message),
          timestamp: message.date.getTime().toString(),
        },
      ],
    });

    // Small delay between messages
    await setTimeout(randomInt(10, 50));
  }

  console.log(`\nLoad test complete! Sent ${MESSAGE_COUNT} messages.`);
  console.log(`\nCheck MongoDB notifications collection for any randomly triggered limits.`);
  console.log(`Query: db.notifications.find({ userId: { $gte: "4000", $lte: "5000" } })\n`);

  await producer.disconnect();
}
