export interface UserEvent {
  userId: number;
  scope: string;
  date: string;
}

export interface ParsedEvent {
  userId: string;
  area: "user" | "payment" | "top-secret";
  action: "create" | "read" | "update" | "delete";
  timestamp: Date;
}
