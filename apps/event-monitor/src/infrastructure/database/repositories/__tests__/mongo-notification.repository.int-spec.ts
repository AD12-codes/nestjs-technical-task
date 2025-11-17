import { Notification } from "@domain/entities/notification.entity";
import { LimitType } from "@domain/types";
import { EventMetadata } from "@domain/value-objects/event-metadata.vo";
import { UserId } from "@domain/value-objects/user-id.vo";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { NotificationDocument, NotificationSchema } from "../../schemas/notification.schema";
import { MongoNotificationRepository } from "../mongo-notification.repository";

describe("MongoNotificationRepository (Integration)", () => {
  let module: TestingModule;
  let repository: MongoNotificationRepository;
  let model: Model<NotificationDocument>;

  const createTestNotification = (overrides?: {
    userId?: string;
    limitType?: LimitType;
  }): Notification => {
    return Notification.create({
      userId: UserId.create(overrides?.userId || "test_user"),
      limitType: overrides?.limitType || LimitType.THREE_USER_DELETIONS,
      eventMetadata: EventMetadata.create({
        area: "user",
        action: "delete",
        timestamp: new Date(),
      }),
      message: "Test notification message",
    });
  };

  beforeAll(async () => {
    const mongoUri =
      "mongodb://admin:password123@localhost:27017/event_monitor_test?authSource=admin";

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([
          { name: NotificationDocument.name, schema: NotificationSchema },
        ]),
      ],
      providers: [MongoNotificationRepository],
    }).compile();

    repository = module.get<MongoNotificationRepository>(MongoNotificationRepository);
    model = module.get(`${NotificationDocument.name}Model`);
  }, 30000);

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  }, 10000);

  beforeEach(async () => {
    await model.deleteMany({});
  });

  describe("save", () => {
    it("should save a new notification to MongoDB", async () => {
      const notification = createTestNotification();

      await repository.save(notification);

      const saved = await model.findById(notification.id.toString()).exec();
      expect(saved).toBeDefined();
      expect(saved?._id).toBe(notification.id.toString());
      expect(saved?.userId).toBe(notification.userId.toString());
      expect(saved?.limitType).toBe(notification.limitType);
      expect(saved?.message).toBe(notification.message);
    });

    it("should save event metadata correctly", async () => {
      const notification = createTestNotification();

      await repository.save(notification);

      const saved = await model.findById(notification.id.toString()).exec();
      expect(saved?.eventMetadata).toBeDefined();
      expect(saved?.eventMetadata.area).toBe("user");
      expect(saved?.eventMetadata.action).toBe("delete");
      expect(saved?.eventMetadata.timestamp).toBeInstanceOf(Date);
    });

    it("should update existing notification on duplicate save", async () => {
      const notification = createTestNotification();

      await repository.save(notification);
      await repository.save(notification);

      const count = await model.countDocuments({ _id: notification.id.toString() });
      expect(count).toBe(1);
    });

    it("should save all three limit types", async () => {
      const limitTypes = [
        LimitType.THREE_USER_DELETIONS,
        LimitType.TOP_SECRET_READ,
        LimitType.TWO_USER_UPDATES_IN_ONE_MINUTE,
      ];

      for (const limitType of limitTypes) {
        const notification = createTestNotification({ limitType });
        await repository.save(notification);
      }

      const saved = await model.find({}).exec();
      expect(saved).toHaveLength(3);

      const savedLimitTypes = saved.map((doc) => doc.limitType);
      for (const limitType of limitTypes) {
        expect(savedLimitTypes).toContain(limitType);
      }
    });

    it("should save notifications for different users", async () => {
      const notification1 = createTestNotification({ userId: "user_1" });
      const notification2 = createTestNotification({ userId: "user_2" });

      await repository.save(notification1);
      await repository.save(notification2);

      const saved = await model.find({}).exec();
      expect(saved).toHaveLength(2);

      const userIds = saved.map((doc) => doc.userId);
      expect(userIds).toContain("user_1");
      expect(userIds).toContain("user_2");
    });

    it("should save optional eventId", async () => {
      const notification = Notification.create({
        userId: UserId.create("test_user"),
        limitType: LimitType.TOP_SECRET_READ,
        eventMetadata: EventMetadata.create({
          area: "top-secret",
          action: "read",
          timestamp: new Date(),
          eventId: "evt_123",
        }),
        message: "Test with event ID",
      });

      await repository.save(notification);

      const saved = await model.findById(notification.id.toString()).exec();
      expect(saved?.eventMetadata.eventId).toBe("evt_123");
    });

    it("should save without optional eventId", async () => {
      const notification = createTestNotification();

      await repository.save(notification);

      const saved = await model.findById(notification.id.toString()).exec();
      expect(saved?.eventMetadata.eventId).toBeUndefined();
    });

    it("should handle concurrent saves", async () => {
      const notifications = Array.from({ length: 10 }, (_, i) =>
        createTestNotification({ userId: `user_${i}` }),
      );

      await Promise.all(notifications.map((n) => repository.save(n)));

      const count = await model.countDocuments({});
      expect(count).toBe(10);
    });
  });
});
