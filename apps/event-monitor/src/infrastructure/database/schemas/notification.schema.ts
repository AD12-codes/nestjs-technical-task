import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ _id: false })
export class EventMetadataDocument {
  @Prop({ required: true, enum: ["user", "payment", "top-secret"] })
  area!: string;

  @Prop({ required: true, enum: ["create", "read", "update", "delete"] })
  action!: string;

  @Prop({ required: true, type: Date })
  timestamp!: Date;

  @Prop({ required: false, type: String })
  eventId?: string;
}

const EventMetadataSchema = SchemaFactory.createForClass(EventMetadataDocument);

@Schema({
  collection: "notifications",
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
export class NotificationDocument {
  @Prop({ required: true, type: String })
  _id!: string;

  @Prop({ required: true, type: String, index: true })
  userId!: string;

  @Prop({
    required: true,
    enum: ["3_USER_DELETIONS", "TOP_SECRET_READ", "2_USER_UPDATED_IN_1MINUTE"],
  })
  limitType!: string;

  @Prop({ required: true, type: EventMetadataSchema })
  eventMetadata!: EventMetadataDocument;

  @Prop({ required: true, type: String, maxlength: 1000 })
  message!: string;

  createdAt!: Date;
}

export type NotificationDocumentType = HydratedDocument<NotificationDocument>;

export const NotificationSchema = SchemaFactory.createForClass(NotificationDocument);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ limitType: 1, createdAt: -1 });
