export enum LimitType {
  THREE_USER_DELETIONS = "3_USER_DELETIONS",
  TOP_SECRET_READ = "TOP_SECRET_READ",
  TWO_USER_UPDATES_IN_ONE_MINUTE = "2_USER_UPDATED_IN_1MINUTE",
}

export type EventArea = "user" | "payment" | "top-secret";

export type EventAction = "create" | "read" | "update" | "delete";
