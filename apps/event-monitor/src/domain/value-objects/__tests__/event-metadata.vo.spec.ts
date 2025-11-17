import { EventMetadata } from "../event-metadata.vo";

describe("EventMetadata", () => {
  const validProps = {
    area: "user" as const,
    action: "delete" as const,
    timestamp: new Date("2025-04-01T05:19:30.478Z"),
    eventId: "evt_123",
  };

  describe("create", () => {
    it("should create EventMetadata with valid props", () => {
      const metadata = EventMetadata.create(validProps);

      expect(metadata).toBeInstanceOf(EventMetadata);
      expect(metadata.area).toBe("user");
      expect(metadata.action).toBe("delete");
      expect(metadata.timestamp).toBeInstanceOf(Date);
      expect(metadata.eventId).toBe("evt_123");
    });

    it("should create without eventId", () => {
      const props = {
        area: "user" as const,
        action: "create" as const,
        timestamp: new Date(),
      };

      const metadata = EventMetadata.create(props);

      expect(metadata.eventId).toBeUndefined();
    });

    it("should accept all valid areas", () => {
      const areas = ["user", "payment", "top-secret"] as const;

      for (const area of areas) {
        const props = { ...validProps, area };
        expect(() => EventMetadata.create(props)).not.toThrow();
      }
    });

    it("should accept all valid actions", () => {
      const actions = ["create", "read", "update", "delete"] as const;

      for (const action of actions) {
        const props = { ...validProps, action };
        expect(() => EventMetadata.create(props)).not.toThrow();
      }
    });

    it("should throw error for invalid area", () => {
      const props = {
        ...validProps,
        area: "invalid" as unknown as typeof validProps.area,
      };

      expect(() => EventMetadata.create(props)).toThrow("Invalid event area");
    });

    it("should throw error for invalid action", () => {
      const props = {
        ...validProps,
        action: "invalid" as unknown as typeof validProps.action,
      };

      expect(() => EventMetadata.create(props)).toThrow("Invalid event action");
    });

    it("should throw error for missing timestamp", () => {
      const props = {
        ...validProps,
        timestamp: undefined as unknown as Date,
      };

      expect(() => EventMetadata.create(props)).toThrow("Event timestamp is required");
    });

    it("should throw error for future timestamp", () => {
      const futureDate = new Date(Date.now() + 130000);
      const props = {
        ...validProps,
        timestamp: futureDate,
      };

      expect(() => EventMetadata.create(props)).toThrow("Event timestamp cannot be in the future");
    });

    it("should throw error for empty eventId", () => {
      const props = {
        ...validProps,
        eventId: "   ",
      };

      expect(() => EventMetadata.create(props)).toThrow(
        "EventId must be a non-empty string if provided",
      );
    });
  });
});
