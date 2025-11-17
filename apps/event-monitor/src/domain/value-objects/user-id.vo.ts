import { BaseValueObject } from "../base-value-object";

interface UserIdProps {
  value: string;
}

export class UserId extends BaseValueObject<UserIdProps> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 255;
  private static readonly VALID_PATTERN = /^[a-zA-Z0-9_-]+$/;

  private constructor(props: UserIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(userId: string): UserId {
    const trimmedId = UserId.validate(userId);
    return new UserId({ value: trimmedId });
  }

  private static validate(userId: string): string {
    if (!userId || userId.trim().length === 0) {
      throw new Error("UserId cannot be empty");
    }

    const trimmed = userId.trim();

    if (trimmed.length < UserId.MIN_LENGTH) {
      throw new Error(`UserId must be at least ${UserId.MIN_LENGTH} character(s)`);
    }

    if (trimmed.length > UserId.MAX_LENGTH) {
      throw new Error(`UserId cannot exceed ${UserId.MAX_LENGTH} characters`);
    }

    if (!UserId.VALID_PATTERN.test(trimmed)) {
      throw new Error("UserId can only contain alphanumeric characters, underscores, and hyphens");
    }

    return trimmed;
  }

  toString(): string {
    return this.value;
  }
}
