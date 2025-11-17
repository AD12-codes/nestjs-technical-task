import { Kafka, Producer } from "kafkajs";
import { MongoClient } from "mongodb";

describe("Event Monitor E2E", () => {
  let kafka: Kafka;
  let producer: Producer;
  let mongoClient: MongoClient;
  let db: ReturnType<MongoClient["db"]>;

  const KAFKA_BROKER = process.env.KAFKA_BROKERS || "localhost:9092";
  const KAFKA_TOPIC = "user-events";
  const MONGO_URI =
    process.env.MONGODB_URI ||
    "mongodb://admin:password123@localhost:27017/event_monitor?authSource=admin";
  const APP_URL = process.env.APP_URL || "http://localhost:3000";

  beforeAll(async () => {
    kafka = new Kafka({
      clientId: "e2e-test-producer",
      brokers: [KAFKA_BROKER],
    });

    producer = kafka.producer();
    await producer.connect();

    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    db = mongoClient.db("event_monitor");

    await db.collection("notifications").deleteMany({});

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }, 30000);

  afterAll(async () => {
    await producer.disconnect();
    await mongoClient.close();
  });

  beforeEach(async () => {
    await db.collection("notifications").deleteMany({});
  });

  describe("Health Check", () => {
    it("should return healthy status", async () => {
      const http = require("node:http");
      const response = await new Promise<{ status: number; data: string }>((resolve, reject) => {
        const req = http.get(
          `${APP_URL}/health`,
          (res: {
            statusCode: number;
            on: (event: string, callback: (data: Buffer) => void) => void;
          }) => {
            let data = "";
            res.on("data", (chunk: Buffer) => {
              data += chunk.toString();
            });
            res.on("end", () => {
              resolve({ status: res.statusCode, data });
            });
          },
        );
        req.on("error", reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error("Timeout"));
        });
      });

      expect(response.status).toBe(200);
      const data = JSON.parse(response.data);
      expect(data.status).toBe("ok");
    });
  });

  describe("Limit 1: 3 Consecutive User Deletions", () => {
    it("should create notification after 3 consecutive deletions", async () => {
      const userId = 1001;
      const now = new Date();
      const events = [
        {
          userId,
          scope: "user.delete",
          date: new Date(now.getTime()).toISOString(),
        },
        {
          userId,
          scope: "user.delete",
          date: new Date(now.getTime() + 1000).toISOString(),
        },
        {
          userId,
          scope: "user.delete",
          date: new Date(now.getTime() + 2000).toISOString(),
        },
      ];

      for (const event of events) {
        await producer.send({
          topic: KAFKA_TOPIC,
          messages: [
            {
              key: event.userId.toString(),
              value: JSON.stringify(event),
            },
          ],
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notifications = await db
        .collection("notifications")
        .find({ userId: userId.toString() })
        .toArray();

      expect(notifications).toHaveLength(1);
      expect(notifications[0].limitType).toBe("3_USER_DELETIONS");
      expect(notifications[0].message).toContain("deleted 3 resources consecutively");
    }, 15000);

    it("should NOT create notification with only 2 deletions", async () => {
      const userId = 1002;
      const now = new Date();
      const events = [
        {
          userId,
          scope: "user.delete",
          date: new Date(now.getTime()).toISOString(),
        },
        {
          userId,
          scope: "user.delete",
          date: new Date(now.getTime() + 1000).toISOString(),
        },
      ];

      for (const event of events) {
        await producer.send({
          topic: KAFKA_TOPIC,
          messages: [
            {
              key: event.userId.toString(),
              value: JSON.stringify(event),
            },
          ],
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notifications = await db
        .collection("notifications")
        .find({ userId: userId.toString() })
        .toArray();

      expect(notifications).toHaveLength(0);
    }, 15000);
  });

  describe("Limit 2: Top-Secret Read", () => {
    it("should create notification immediately on top-secret read", async () => {
      const userId = 2001;
      const event = {
        userId,
        scope: "top-secret.read",
        date: new Date().toISOString(),
      };

      await producer.send({
        topic: KAFKA_TOPIC,
        messages: [
          {
            key: event.userId.toString(),
            value: JSON.stringify(event),
          },
        ],
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notifications = await db
        .collection("notifications")
        .find({ userId: userId.toString() })
        .toArray();

      expect(notifications).toHaveLength(1);
      expect(notifications[0].limitType).toBe("TOP_SECRET_READ");
      expect(notifications[0].message).toContain("accessed top-secret resource");
    }, 15000);

    it("should NOT create notification for top-secret create/update/delete", async () => {
      const userId = 2002;
      const events = [
        {
          userId,
          scope: "top-secret.create",
          date: new Date().toISOString(),
        },
        {
          userId,
          scope: "top-secret.update",
          date: new Date().toISOString(),
        },
        {
          userId,
          scope: "top-secret.delete",
          date: new Date().toISOString(),
        },
      ];

      for (const event of events) {
        await producer.send({
          topic: KAFKA_TOPIC,
          messages: [
            {
              key: event.userId.toString(),
              value: JSON.stringify(event),
            },
          ],
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notifications = await db
        .collection("notifications")
        .find({ userId: userId.toString() })
        .toArray();

      expect(notifications).toHaveLength(0);
    }, 15000);
  });

  describe("Limit 3: 2 User Updates in 1 Minute", () => {
    it("should create notification after 2 updates within 1 minute", async () => {
      const userId = 3001;
      const baseTime = new Date();

      const events = [
        {
          userId,
          scope: "user.update",
          date: baseTime.toISOString(),
        },
        {
          userId,
          scope: "user.update",
          date: new Date(baseTime.getTime() + 30 * 1000).toISOString(),
        },
      ];

      for (const event of events) {
        await producer.send({
          topic: KAFKA_TOPIC,
          messages: [
            {
              key: event.userId.toString(),
              value: JSON.stringify(event),
            },
          ],
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notifications = await db
        .collection("notifications")
        .find({ userId: userId.toString() })
        .toArray();

      expect(notifications).toHaveLength(1);
      expect(notifications[0].limitType).toBe("2_USER_UPDATED_IN_1MINUTE");
      expect(notifications[0].message).toContain("updated 2 users within 1 minute");
    }, 15000);

    it("should NOT create notification if updates are more than 1 minute apart", async () => {
      const userId = 3002;
      const baseTime = new Date();

      const events = [
        {
          userId,
          scope: "user.update",
          date: baseTime.toISOString(),
        },
        {
          userId,
          scope: "user.update",
          date: new Date(baseTime.getTime() + 61 * 1000).toISOString(),
        },
      ];

      for (const event of events) {
        await producer.send({
          topic: KAFKA_TOPIC,
          messages: [
            {
              key: event.userId.toString(),
              value: JSON.stringify(event),
            },
          ],
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notifications = await db
        .collection("notifications")
        .find({ userId: userId.toString() })
        .toArray();

      expect(notifications).toHaveLength(0);
    }, 15000);
  });

  describe("Edge Cases", () => {
    it("should handle multiple users simultaneously", async () => {
      const users = [4001, 4002, 4003];
      const events = users.map((userId) => ({
        userId,
        scope: "top-secret.read",
        date: new Date().toISOString(),
      }));

      await producer.sendBatch({
        topicMessages: [
          {
            topic: KAFKA_TOPIC,
            messages: events.map((event) => ({
              key: event.userId.toString(),
              value: JSON.stringify(event),
            })),
          },
        ],
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notifications = await db.collection("notifications").find({}).toArray();

      expect(notifications.length).toBeGreaterThanOrEqual(3);
      expect(notifications.map((n: Record<string, unknown>) => n.userId as string).sort()).toEqual(
        users.map((u) => u.toString()).sort(),
      );
    }, 15000);

    it("should NOT create notification for events that dont trigger limits", async () => {
      const userId = 5001;
      const events = [
        { userId, scope: "user.create", date: new Date().toISOString() },
        { userId, scope: "payment.create", date: new Date().toISOString() },
        { userId, scope: "payment.read", date: new Date().toISOString() },
      ];

      for (const event of events) {
        await producer.send({
          topic: KAFKA_TOPIC,
          messages: [
            {
              key: event.userId.toString(),
              value: JSON.stringify(event),
            },
          ],
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notifications = await db
        .collection("notifications")
        .find({ userId: userId.toString() })
        .toArray();

      expect(notifications).toHaveLength(0);
    }, 15000);
  });
});
