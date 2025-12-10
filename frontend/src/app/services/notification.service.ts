// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationKind = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: number;
  message: string;
  kind: NotificationKind;
  at: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private items: NotificationItem[] = [];
  private subject = new BehaviorSubject<NotificationItem[]>([]);
  notifications$ = this.subject.asObservable();

  add(message: string, kind: NotificationKind = 'info') {
    const item: NotificationItem = { id: Date.now(), message, kind, at: new Date() };
    this.items = [item, ...this.items].slice(0, 20); // keep last 20
    this.subject.next(this.items);
  }

  clear() {
    this.items = [];
    this.subject.next(this.items);
  }

  clearOne(id: number) {
    this.items = this.items.filter(n => n.id !== id);
    this.subject.next(this.items);
  }
}
