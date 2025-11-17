import { BaseEntity } from "../base-entity";
import { LimitType } from "../types";
import { EventMetadata } from "../value-objects/event-metadata.vo";
import { NotificationId } from "../value-objects/notification-id.vo";
import { UserId } from "../value-objects/user-id.vo";

interface NotificationProps {
  id: NotificationId;
  userId: UserId;
  limitType: LimitType;
  eventMetadata: EventMetadata;
  message: string;
  createdAt: Date;
}

export class Notification extends BaseEntity<NotificationId> {
  private readonly props: NotificationProps;

  private constructor(props: NotificationProps) {
    super(props.id);
    this.props = props;
  }

  get id(): NotificationId {
    return this.props.id;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get limitType(): LimitType {
    return this.props.limitType;
  }

  get eventMetadata(): EventMetadata {
    return this.props.eventMetadata;
  }

  get message(): string {
    return this.props.message;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static create(params: {
    userId: UserId;
    limitType: LimitType;
    eventMetadata: EventMetadata;
    message: string;
  }): Notification {
    Notification.validateMessage(params.message);

    const props: NotificationProps = {
      id: NotificationId.create(),
      userId: params.userId,
      limitType: params.limitType,
      eventMetadata: params.eventMetadata,
      message: params.message,
      createdAt: new Date(),
    };

    return new Notification(props);
  }

  static reconstitute(props: NotificationProps): Notification {
    return new Notification(props);
  }

  private static validateMessage(message: string): void {
    if (!message || message.trim().length === 0) {
      throw new Error("Notification message cannot be empty");
    }

    if (message.length > 1000) {
      throw new Error("Notification message cannot exceed 1000 characters");
    }
  }

  toJSON() {
    return {
      id: this.props.id.toString(),
      userId: this.props.userId.toString(),
      limitType: this.props.limitType,
      eventMetadata: this.props.eventMetadata.toJSON(),
      message: this.props.message,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
