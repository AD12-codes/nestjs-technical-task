import type { ParsedEvent } from "@domain/events/user-event";
import { TopSecretReadChecker } from "../top-secret-read.checker";

describe("TopSecretReadChecker", () => {
  let checker: TopSecretReadChecker;

  beforeEach(() => {
    checker = new TopSecretReadChecker();
  });

  it("should create notification for top-secret read", async () => {
    const event: ParsedEvent = {
      userId: "42",
      area: "top-secret",
      action: "read",
      timestamp: new Date("2025-04-01T06:00:00.000Z"),
    };

    const result = await checker.check(event);

    expect(result).toBeDefined();
    expect(result?.userId.toString()).toBe("42");
    expect(result?.limitType).toBe("TOP_SECRET_READ");
    expect(result?.message).toContain("accessed top-secret resource");
  });

  it("should return null for top-secret with non-read action", async () => {
    const event: ParsedEvent = {
      userId: "42",
      area: "top-secret",
      action: "create",
      timestamp: new Date(),
    };

    const result = await checker.check(event);
    expect(result).toBeNull();
  });

  it("should return null for read in different area", async () => {
    const event: ParsedEvent = {
      userId: "42",
      area: "user",
      action: "read",
      timestamp: new Date(),
    };

    const result = await checker.check(event);
    expect(result).toBeNull();
  });

  it("should create notification for every top-secret read", async () => {
    const event1: ParsedEvent = {
      userId: "42",
      area: "top-secret",
      action: "read",
      timestamp: new Date(),
    };
    const event2: ParsedEvent = {
      userId: "42",
      area: "top-secret",
      action: "read",
      timestamp: new Date(),
    };

    const result1 = await checker.check(event1);
    const result2 = await checker.check(event2);

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });

  it("should work for different users", async () => {
    const user1Event: ParsedEvent = {
      userId: "42",
      area: "top-secret",
      action: "read",
      timestamp: new Date(),
    };
    const user2Event: ParsedEvent = {
      userId: "99",
      area: "top-secret",
      action: "read",
      timestamp: new Date(),
    };

    const result1 = await checker.check(user1Event);
    const result2 = await checker.check(user2Event);

    expect(result1).toBeDefined();
    expect(result1?.userId.toString()).toBe("42");
    expect(result2).toBeDefined();
    expect(result2?.userId.toString()).toBe("99");
  });

  it("should return null for all other actions", async () => {
    const actions = ["create", "update", "delete"] as const;

    for (const action of actions) {
      const event: ParsedEvent = {
        userId: "42",
        area: "top-secret",
        action,
        timestamp: new Date(),
      };

      const result = await checker.check(event);
      expect(result).toBeNull();
    }
  });
});
