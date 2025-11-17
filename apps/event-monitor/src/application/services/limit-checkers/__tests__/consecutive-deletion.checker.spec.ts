import type { ParsedEvent } from "@domain/events/user-event";
import type { ConfigService } from "@nestjs/config";
import { EventStorageService } from "../../event-storage.service";
import { ConsecutiveDeletionChecker } from "../consecutive-deletion.checker";

describe("ConsecutiveDeletionChecker", () => {
  let checker: ConsecutiveDeletionChecker;
  let eventStorage: EventStorageService;

  const mockConfigService = {
    get: jest.fn((_key: string, defaultValue?: number) => defaultValue),
  } as unknown as ConfigService;

  beforeEach(() => {
    eventStorage = new EventStorageService();
    checker = new ConsecutiveDeletionChecker(eventStorage, mockConfigService);
  });

  it("should return null for non-delete events", async () => {
    const event: ParsedEvent = {
      userId: "83",
      area: "user",
      action: "create",
      timestamp: new Date(),
    };

    const result = await checker.check(event);
    expect(result).toBeNull();
  });

  it("should return null for delete in different area", async () => {
    const event: ParsedEvent = {
      userId: "83",
      area: "payment",
      action: "delete",
      timestamp: new Date(),
    };

    const result = await checker.check(event);
    expect(result).toBeNull();
  });

  it("should return null when less than 3 deletions", async () => {
    const event1: ParsedEvent = {
      userId: "83",
      area: "user",
      action: "delete",
      timestamp: new Date(),
    };
    const event2: ParsedEvent = {
      userId: "83",
      area: "user",
      action: "delete",
      timestamp: new Date(),
    };

    eventStorage.addEvent(event1);
    eventStorage.addEvent(event2);

    const result = await checker.check(event2);
    expect(result).toBeNull();
  });

  it("should create notification on 3rd consecutive deletion", async () => {
    const event1: ParsedEvent = {
      userId: "83",
      area: "user",
      action: "delete",
      timestamp: new Date("2025-04-01T05:19:30.478Z"),
    };
    const event2: ParsedEvent = {
      userId: "83",
      area: "user",
      action: "delete",
      timestamp: new Date("2025-04-01T05:19:31.500Z"),
    };
    const event3: ParsedEvent = {
      userId: "83",
      area: "user",
      action: "delete",
      timestamp: new Date("2025-04-01T05:19:32.600Z"),
    };

    eventStorage.addEvent(event1);
    eventStorage.addEvent(event2);
    eventStorage.addEvent(event3);

    const result = await checker.check(event3);

    expect(result).toBeDefined();
    expect(result?.userId.toString()).toBe("83");
    expect(result?.limitType).toBe("3_USER_DELETIONS");
    expect(result?.message).toContain("deleted 3 resources consecutively");
  });

  it("should return null when recent events are not all deletions", async () => {
    const event1: ParsedEvent = {
      userId: "83",
      area: "user",
      action: "delete",
      timestamp: new Date(),
    };
    const event2: ParsedEvent = {
      userId: "83",
      area: "user",
      action: "create",
      timestamp: new Date(),
    };
    const event3: ParsedEvent = {
      userId: "83",
      area: "user",
      action: "delete",
      timestamp: new Date(),
    };

    eventStorage.addEvent(event1);
    eventStorage.addEvent(event2);
    eventStorage.addEvent(event3);

    const result = await checker.check(event3);
    expect(result).toBeNull();
  });

  it("should track deletions per user separately", async () => {
    const user1Event: ParsedEvent = {
      userId: "83",
      area: "user",
      action: "delete",
      timestamp: new Date(),
    };
    const user2Event: ParsedEvent = {
      userId: "99",
      area: "user",
      action: "delete",
      timestamp: new Date(),
    };

    eventStorage.addEvent(user1Event);
    eventStorage.addEvent(user1Event);
    eventStorage.addEvent(user2Event);
    eventStorage.addEvent(user1Event);

    const result = await checker.check(user1Event);
    expect(result).toBeDefined();

    const result2 = await checker.check(user2Event);
    expect(result2).toBeNull();
  });
});
