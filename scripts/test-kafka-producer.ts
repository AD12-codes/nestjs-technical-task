import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "test-producer",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
const topic = "user-events";

interface UserEvent {
  userId: number;
  scope: string;
  date: string;
}

const testEvents: UserEvent[] = [
  // Test Limit 1: 3 user deletions
  {
    userId: 83,
    scope: "user.delete",
    date: new Date("2025-04-01T05:19:30.478Z").toISOString(),
  },
  {
    userId: 83,
    scope: "user.delete",
    date: new Date("2025-04-01T05:19:31.500Z").toISOString(),
  },
  {
    userId: 83,
    scope: "user.delete",
    date: new Date("2025-04-01T05:19:32.600Z").toISOString(),
  },

  // Test Limit 2: Top-secret read
  {
    userId: 42,
    scope: "top-secret.read",
    date: new Date("2025-04-01T06:00:00.000Z").toISOString(),
  },

  // Test Limit 3: 2 user updates in 1 minute
  {
    userId: 99,
    scope: "user.update",
    date: new Date("2025-04-01T07:00:00.000Z").toISOString(),
  },
  {
    userId: 99,
    scope: "user.update",
    date: new Date("2025-04-01T07:00:30.000Z").toISOString(),
  },

  // Some normal events that shouldn't trigger limits
  {
    userId: 50,
    scope: "user.create",
    date: new Date("2025-04-01T08:00:00.000Z").toISOString(),
  },
  {
    userId: 51,
    scope: "payment.create",
    date: new Date("2025-04-01T08:01:00.000Z").toISOString(),
  },
];

async function run() {
  try {
    console.log("Connecting to Kafka...");
    await producer.connect();
    console.log("Connected to Kafka");

    console.log(`\nSending ${testEvents.length} test events to topic: ${topic}\n`);

    for (const event of testEvents) {
      const message = {
        key: event.userId.toString(),
        value: JSON.stringify(event),
      };

      await producer.send({
        topic,
        messages: [message],
      });

      console.log(`Sent event:`, {
        userId: event.userId,
        scope: event.scope,
        date: event.date,
      });

      // Small delay between messages for readability
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`\nSuccessfully sent ${testEvents.length} events`);
    console.log("\nExpected outcomes:");
    console.log("  - User 83: 3 user.delete events → Should trigger Limit 1");
    console.log("  - User 42: 1 top-secret.read event → Should trigger Limit 2");
    console.log("  - User 99: 2 user.update events in 30s → Should trigger Limit 3");
    console.log("  - Users 50, 51: Normal events → No notifications");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await producer.disconnect();
    console.log("\nDisconnected from Kafka");
  }
}

run();
