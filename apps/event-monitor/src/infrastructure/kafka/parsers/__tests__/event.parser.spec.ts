import type { UserEvent } from "@domain/events/user-event";
import { EventParseError, parseUserEvent } from "../event.parser";

describe("EventParser", () => {
  describe("parseUserEvent", () => {
    it("should parse valid user.delete event", () => {
      const event: UserEvent = {
        userId: 83,
        scope: "user.delete",
        date: "2025-04-01T05:19:30.478Z",
      };

      const result = parseUserEvent(event);

      expect(result).toEqual({
        userId: "83",
        area: "user",
        action: "delete",
        timestamp: new Date("2025-04-01T05:19:30.478Z"),
      });
    });

    it("should parse valid top-secret.read event", () => {
      const event: UserEvent = {
        userId: 42,
        scope: "top-secret.read",
        date: "2025-04-01T06:00:00.000Z",
      };

      const result = parseUserEvent(event);

      expect(result).toEqual({
        userId: "42",
        area: "top-secret",
        action: "read",
        timestamp: new Date("2025-04-01T06:00:00.000Z"),
      });
    });

    it("should parse valid payment.create event", () => {
      const event: UserEvent = {
        userId: 99,
        scope: "payment.create",
        date: "2025-04-01T07:00:00.000Z",
      };

      const result = parseUserEvent(event);

      expect(result).toEqual({
        userId: "99",
        area: "payment",
        action: "create",
        timestamp: new Date("2025-04-01T07:00:00.000Z"),
      });
    });

    it("should parse user.update event", () => {
      const event: UserEvent = {
        userId: 50,
        scope: "user.update",
        date: "2025-04-01T08:00:00.000Z",
      };

      const result = parseUserEvent(event);

      expect(result.area).toBe("user");
      expect(result.action).toBe("update");
    });

    it("should throw error for missing userId", () => {
      const event = {
        scope: "user.delete",
        date: "2025-04-01T05:19:30.478Z",
      } as UserEvent;

      expect(() => parseUserEvent(event)).toThrow(EventParseError);
      expect(() => parseUserEvent(event)).toThrow("Invalid userId");
    });

    it("should throw error for non-numeric userId", () => {
      const event = {
        userId: "abc",
        scope: "user.delete",
        date: "2025-04-01T05:19:30.478Z",
      } as unknown as UserEvent;

      expect(() => parseUserEvent(event)).toThrow(EventParseError);
    });

    it("should throw error for missing scope", () => {
      const event = {
        userId: 83,
        date: "2025-04-01T05:19:30.478Z",
      } as UserEvent;

      expect(() => parseUserEvent(event)).toThrow(EventParseError);
      expect(() => parseUserEvent(event)).toThrow("Invalid scope");
    });

    it("should throw error for invalid scope format", () => {
      const event: UserEvent = {
        userId: 83,
        scope: "invalid",
        date: "2025-04-01T05:19:30.478Z",
      };

      expect(() => parseUserEvent(event)).toThrow(EventParseError);
      expect(() => parseUserEvent(event)).toThrow("Invalid scope format");
    });

    it("should throw error for invalid area", () => {
      const event: UserEvent = {
        userId: 83,
        scope: "invalid-area.delete",
        date: "2025-04-01T05:19:30.478Z",
      };

      expect(() => parseUserEvent(event)).toThrow(EventParseError);
      expect(() => parseUserEvent(event)).toThrow("Invalid area");
    });

    it("should throw error for invalid action", () => {
      const event: UserEvent = {
        userId: 83,
        scope: "user.invalid-action",
        date: "2025-04-01T05:19:30.478Z",
      };

      expect(() => parseUserEvent(event)).toThrow(EventParseError);
      expect(() => parseUserEvent(event)).toThrow("Invalid action");
    });

    it("should throw error for missing date", () => {
      const event = {
        userId: 83,
        scope: "user.delete",
      } as UserEvent;

      expect(() => parseUserEvent(event)).toThrow(EventParseError);
      expect(() => parseUserEvent(event)).toThrow("Invalid date");
    });

    it("should throw error for invalid date format", () => {
      const event: UserEvent = {
        userId: 83,
        scope: "user.delete",
        date: "invalid-date",
      };

      expect(() => parseUserEvent(event)).toThrow(EventParseError);
      expect(() => parseUserEvent(event)).toThrow("Invalid date format");
    });

    it("should support all valid areas", () => {
      const areas = ["user", "payment", "top-secret"];

      for (const area of areas) {
        const event: UserEvent = {
          userId: 1,
          scope: `${area}.create`,
          date: "2025-04-01T05:19:30.478Z",
        };

        const result = parseUserEvent(event);
        expect(result.area).toBe(area);
      }
    });

    it("should support all valid actions", () => {
      const actions = ["create", "read", "update", "delete"];

      for (const action of actions) {
        const event: UserEvent = {
          userId: 1,
          scope: `user.${action}`,
          date: "2025-04-01T05:19:30.478Z",
        };

        const result = parseUserEvent(event);
        expect(result.action).toBe(action);
      }
    });

    it("should convert userId to string", () => {
      const event: UserEvent = {
        userId: 123,
        scope: "user.delete",
        date: "2025-04-01T05:19:30.478Z",
      };

      const result = parseUserEvent(event);
      expect(result.userId).toBe("123");
      expect(typeof result.userId).toBe("string");
    });

    it("should convert date string to Date object", () => {
      const event: UserEvent = {
        userId: 83,
        scope: "user.delete",
        date: "2025-04-01T05:19:30.478Z",
      };

      const result = parseUserEvent(event);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.timestamp.toISOString()).toBe("2025-04-01T05:19:30.478Z");
    });
  });
});
