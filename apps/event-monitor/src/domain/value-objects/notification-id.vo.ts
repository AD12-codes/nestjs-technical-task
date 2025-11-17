import { randomUUID } from "node:crypto";
import { BaseValueObject } from "../base-value-object";

interface NotificationIdProps {
  value: string;
}

export class NotificationId extends BaseValueObject<NotificationIdProps> {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  private constructor(props: NotificationIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(): NotificationId {
    return new NotificationId({ value: randomUUID() });
  }

  static from(id: string): NotificationId {
    if (!NotificationId.isValid(id)) {
      throw new Error(`Invalid NotificationId format: ${id}`);
    }
    return new NotificationId({ value: id });
  }

  static isValid(id: string): boolean {
    return NotificationId.UUID_REGEX.test(id);
  }

  toString(): string {
    return this.value;
  }
}
