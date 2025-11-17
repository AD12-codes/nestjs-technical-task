import { NotificationId } from "../notification-id.vo";

describe("NotificationId", () => {
  describe("create", () => {
    it("should create a new NotificationId with UUID", () => {
      const id = NotificationId.create();

      expect(id).toBeInstanceOf(NotificationId);
      expect(id.value).toBeDefined();
      expect(NotificationId.isValid(id.value)).toBe(true);
    });

    it("should create unique IDs", () => {
      const id1 = NotificationId.create();
      const id2 = NotificationId.create();

      expect(id1.value).not.toBe(id2.value);
    });
  });
});
