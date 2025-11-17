import { UserId } from "../user-id.vo";

describe("UserId", () => {
  describe("create", () => {
    it("should create UserId from valid string", () => {
      const userId = UserId.create("user_123");

      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toBe("user_123");
    });

    it("should trim whitespace", () => {
      const userId = UserId.create("  user_123  ");

      expect(userId.value).toBe("user_123");
    });

    it("should accept alphanumeric with underscores and hyphens", () => {
      const validIds = ["user123", "user_123", "user-123", "USER_123", "123", "a"];

      for (const id of validIds) {
        expect(() => UserId.create(id)).not.toThrow();
      }
    });

    it("should throw error for empty string", () => {
      expect(() => UserId.create("")).toThrow("UserId cannot be empty");
      expect(() => UserId.create("   ")).toThrow("UserId cannot be empty");
    });

    it("should throw error for invalid characters", () => {
      const invalidIds = [
        "user@123",
        "user 123",
        "user#123",
        "user.123",
        "user/123",
        "user\\123",
        "user!123",
      ];

      for (const id of invalidIds) {
        expect(() => UserId.create(id)).toThrow(
          "UserId can only contain alphanumeric characters, underscores, and hyphens",
        );
      }
    });

    it("should throw error for string exceeding max length", () => {
      const longId = "a".repeat(256);

      expect(() => UserId.create(longId)).toThrow("UserId cannot exceed 255 characters");
    });

    it("should accept string at max length", () => {
      const maxId = "a".repeat(255);

      expect(() => UserId.create(maxId)).not.toThrow();
    });
  });
});
