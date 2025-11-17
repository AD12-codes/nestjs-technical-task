import type { ParsedEvent } from "@domain/events/user-event";
import { Injectable } from "@nestjs/common";

interface StoredEvent extends ParsedEvent {
  id: string;
}

@Injectable()
export class EventStorageService {
  private events: Map<string, StoredEvent[]> = new Map();
  private eventIdCounter = 0;

  addEvent(event: ParsedEvent): void {
    const storedEvent: StoredEvent = {
      ...event,
      id: `evt_${++this.eventIdCounter}`,
    };

    const userEvents = this.events.get(event.userId) || [];
    userEvents.push(storedEvent);
    this.events.set(event.userId, userEvents);
  }

  getUserEvents(userId: string): StoredEvent[] {
    return this.events.get(userId) || [];
  }

  getRecentUserEvents(userId: string, count: number): StoredEvent[] {
    const userEvents = this.getUserEvents(userId);
    return userEvents.slice(-count);
  }

  getEventsInTimeWindow(userId: string, windowMs: number, referenceTime?: Date): StoredEvent[] {
    const userEvents = this.getUserEvents(userId);
    const refTime = referenceTime || new Date();
    const cutoffTime = new Date(refTime.getTime() - windowMs);

    return userEvents.filter((event) => event.timestamp >= cutoffTime);
  }

  clearUserEvents(userId: string): void {
    this.events.delete(userId);
  }

  clearAll(): void {
    this.events.clear();
    this.eventIdCounter = 0;
  }
}
