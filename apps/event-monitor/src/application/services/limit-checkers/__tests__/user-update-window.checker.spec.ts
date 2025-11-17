import type { ParsedEvent } from "@domain/events/user-event";
import type { ConfigService } from "@nestjs/config";
import { EventStorageService } from "../../event-storage.service";
import { UserUpdateWindowChecker } from "../user-update-window.checker";

describe("UserUpdateWindowChecker", () => {
  let checker: UserUpdateWindowChecker;
  let eventStorage: EventStorageService;

  const mockConfigService = {
    get: jest.fn((_key: string, defaultValue?: number) => defaultValue),
  } as unknown as ConfigService;

  beforeEach(() => {
    eventStorage = new EventStorageService();
    checker = new UserUpdateWindowChecker(eventStorage, mockConfigService);
  });

  it("should return null for non-update events", async () => {
    const event: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "create",
      timestamp: new Date(),
    };

    const result = await checker.check(event);
    expect(result).toBeNull();
  });

  it("should return null for update in different area", async () => {
    const event: ParsedEvent = {
      userId: "99",
      area: "payment",
      action: "update",
      timestamp: new Date(),
    };

    const result = await checker.check(event);
    expect(result).toBeNull();
  });

  it("should return null when only 1 update", async () => {
    const event: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: new Date(),
    };

    eventStorage.addEvent(event);

    const result = await checker.check(event);
    expect(result).toBeNull();
  });

  it("should create notification on 2nd update within 1 minute", async () => {
    const baseTime = new Date("2025-04-01T07:00:00.000Z");
    const event1: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: baseTime,
    };
    const event2: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: new Date(baseTime.getTime() + 30 * 1000),
    };

    eventStorage.addEvent(event1);
    eventStorage.addEvent(event2);

    const result = await checker.check(event2);

    expect(result).toBeDefined();
    expect(result?.userId.toString()).toBe("99");
    expect(result?.limitType).toBe("2_USER_UPDATED_IN_1MINUTE");
    expect(result?.message).toContain("updated");
    expect(result?.message).toContain("within 1 minute");
  });

  it("should return null when updates are more than 1 minute apart", async () => {
    const baseTime = new Date("2025-04-01T07:00:00.000Z");
    const event1: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: baseTime,
    };
    const event2: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: new Date(baseTime.getTime() + 61 * 1000),
    };

    eventStorage.addEvent(event1);
    eventStorage.addEvent(event2);

    const result = await checker.check(event2);
    expect(result).toBeNull();
  });

  it("should handle exactly 1 minute window edge case", async () => {
    const baseTime = new Date("2025-04-01T07:00:00.000Z");
    const event1: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: baseTime,
    };
    const event2: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: new Date(baseTime.getTime() + 60 * 1000),
    };

    eventStorage.addEvent(event1);
    eventStorage.addEvent(event2);

    const result = await checker.check(event2);
    expect(result).toBeDefined();
  });

  it("should ignore non-update events in the window", async () => {
    const baseTime = new Date("2025-04-01T07:00:00.000Z");
    const event1: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: baseTime,
    };
    const event2: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "create",
      timestamp: new Date(baseTime.getTime() + 10 * 1000),
    };
    const event3: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "delete",
      timestamp: new Date(baseTime.getTime() + 20 * 1000),
    };
    const event4: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: new Date(baseTime.getTime() + 30 * 1000),
    };

    eventStorage.addEvent(event1);
    eventStorage.addEvent(event2);
    eventStorage.addEvent(event3);
    eventStorage.addEvent(event4);

    const result = await checker.check(event4);
    expect(result).toBeDefined();
  });

  it("should track updates per user separately", async () => {
    const baseTime = new Date("2025-04-01T07:00:00.000Z");
    const user1Event1: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: baseTime,
    };
    const user1Event2: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: new Date(baseTime.getTime() + 30 * 1000),
    };
    const user2Event: ParsedEvent = {
      userId: "50",
      area: "user",
      action: "update",
      timestamp: new Date(baseTime.getTime() + 15 * 1000),
    };

    eventStorage.addEvent(user1Event1);
    eventStorage.addEvent(user2Event);
    eventStorage.addEvent(user1Event2);

    const result1 = await checker.check(user1Event2);
    expect(result1).toBeDefined();

    const result2 = await checker.check(user2Event);
    expect(result2).toBeNull();
  });

  it("should trigger for more than 2 updates", async () => {
    const baseTime = new Date("2025-04-01T07:00:00.000Z");
    const event1: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: baseTime,
    };
    const event2: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: new Date(baseTime.getTime() + 20 * 1000),
    };
    const event3: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "update",
      timestamp: new Date(baseTime.getTime() + 40 * 1000),
    };

    eventStorage.addEvent(event1);
    eventStorage.addEvent(event2);
    eventStorage.addEvent(event3);

    const result = await checker.check(event3);
    expect(result).toBeDefined();
    expect(result?.message).toContain("3 users");
  });
});
