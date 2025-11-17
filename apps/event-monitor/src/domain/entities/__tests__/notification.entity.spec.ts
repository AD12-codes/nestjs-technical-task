import { LimitType } from "../../types";
import { EventMetadata } from "../../value-objects/event-metadata.vo";
import { NotificationId } from "../../value-objects/notification-id.vo";
import { UserId } from "../../value-objects/user-id.vo";
import { Notification } from "../notification.entity";

describe("Notification", () => {
  const validParams = {
    userId: UserId.create("user_123"),
    limitType: LimitType.THREE_USER_DELETIONS,
    eventMetadata: EventMetadata.create({
      area: "user" as const,
      action: "delete" as const,
      timestamp: new Date("2025-04-01T05:19:30.478Z"),
      eventId: "evt_123",
    }),
    message: "User deleted 3 resources in a row",
  };

  describe("create", () => {
    it("should create a new notification with generated ID", () => {
      const notification = Notification.create(validParams);

      expect(notification).toBeInstanceOf(Notification);
      expect(notification.id).toBeInstanceOf(NotificationId);
      expect(notification.userId).toBe(validParams.userId);
      expect(notification.limitType).toBe(validParams.limitType);
      expect(notification.eventMetadata).toBe(validParams.eventMetadata);
      expect(notification.message).toBe(validParams.message);
      expect(notification.createdAt).toBeInstanceOf(Date);
    });

    it("should create notification with all limit types", () => {
      const limitTypes = [
        LimitType.THREE_USER_DELETIONS,
        LimitType.TOP_SECRET_READ,
        LimitType.TWO_USER_UPDATES_IN_ONE_MINUTE,
      ];

      for (const limitType of limitTypes) {
        const notification = Notification.create({
          ...validParams,
          limitType,
        });

        expect(notification.limitType).toBe(limitType);
      }
    });

    it("should set createdAt to current time", () => {
      const before = new Date();
      const notification = Notification.create(validParams);
      const after = new Date();

      expect(notification.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(notification.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should throw error for empty message", () => {
      const params = {
        ...validParams,
        message: "",
      };

      expect(() => Notification.create(params)).toThrow("Notification message cannot be empty");
    });

    it("should throw error for message exceeding 1000 characters", () => {
      const params = {
        ...validParams,
        message: "a".repeat(1001),
      };

      expect(() => Notification.create(params)).toThrow(
        "Notification message cannot exceed 1000 characters",
      );
    });

    it("should accept message at max length", () => {
      const params = {
        ...validParams,
        message: "a".repeat(1000),
      };

      expect(() => Notification.create(params)).not.toThrow();
    });
  });

  describe("reconstitute", () => {
    it("should recreate notification from props", () => {
      const props = {
        id: NotificationId.create(),
        userId: UserId.create("user_123"),
        limitType: LimitType.TOP_SECRET_READ,
        eventMetadata: EventMetadata.create({
          area: "top-secret" as const,
          action: "read" as const,
          timestamp: new Date(),
        }),
        message: "Top secret read detected",
        createdAt: new Date("2025-04-01T10:00:00.000Z"),
      };

      const notification = Notification.reconstitute(props);

      expect(notification).toBeInstanceOf(Notification);
      expect(notification.id).toBe(props.id);
      expect(notification.userId).toBe(props.userId);
      expect(notification.limitType).toBe(props.limitType);
      expect(notification.eventMetadata).toBe(props.eventMetadata);
      expect(notification.message).toBe(props.message);
      expect(notification.createdAt).toBe(props.createdAt);
    });
  });

  describe("business scenarios", () => {
    it("should create notification for 3 user deletions limit", () => {
      const notification = Notification.create({
        userId: UserId.create("user_456"),
        limitType: LimitType.THREE_USER_DELETIONS,
        eventMetadata: EventMetadata.create({
          area: "user",
          action: "delete",
          timestamp: new Date(),
        }),
        message: "User deleted 3 resources consecutively",
      });

      expect(notification.limitType).toBe(LimitType.THREE_USER_DELETIONS);
      expect(notification.eventMetadata.area).toBe("user");
      expect(notification.eventMetadata.action).toBe("delete");
    });

    it("should create notification for top-secret read limit", () => {
      const notification = Notification.create({
        userId: UserId.create("user_789"),
        limitType: LimitType.TOP_SECRET_READ,
        eventMetadata: EventMetadata.create({
          area: "top-secret",
          action: "read",
          timestamp: new Date(),
        }),
        message: "Unauthorized access to top-secret resource",
      });

      expect(notification.limitType).toBe(LimitType.TOP_SECRET_READ);
      expect(notification.eventMetadata.area).toBe("top-secret");
      expect(notification.eventMetadata.action).toBe("read");
    });

    it("should create notification for 2 user updates in 1 minute limit", () => {
      const notification = Notification.create({
        userId: UserId.create("user_999"),
        limitType: LimitType.TWO_USER_UPDATES_IN_ONE_MINUTE,
        eventMetadata: EventMetadata.create({
          area: "user",
          action: "update",
          timestamp: new Date(),
        }),
        message: "User updated 2 users within 1 minute",
      });

      expect(notification.limitType).toBe(LimitType.TWO_USER_UPDATES_IN_ONE_MINUTE);
      expect(notification.eventMetadata.area).toBe("user");
      expect(notification.eventMetadata.action).toBe("update");
    });
  });
});
