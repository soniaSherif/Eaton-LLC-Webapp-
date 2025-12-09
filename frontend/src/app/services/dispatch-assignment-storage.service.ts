import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AssignmentData = {
  id?: number;
  job: string;
  driver: string;
  truck_type: string;
  jobDate: string;
  time: string;
  selected?: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class DispatchAssignmentStorageService {
  private readonly STORAGE_KEY = 'dispatch_assignments';
  private assignmentsSubject = new BehaviorSubject<AssignmentData[]>(this.getInitialData());
  public assignments$: Observable<AssignmentData[]> = this.assignmentsSubject.asObservable();

  constructor() {
    // Load from localStorage on init
    this.loadFromStorage();
  }

  private getInitialData(): AssignmentData[] {
    return [
      { id: 1, job: 'HW72', driver: 'John Doe', truck_type: 'Semi', jobDate: '2025-03-13', time: '10:30', selected: false },
      { id: 2, job: 'I-32', driver: 'Jane Doe', truck_type: 'Belly Dump', jobDate: '2025-06-25', time: '14:00', selected: false },
      { id: 3, job: 'HW73', driver: 'Alice Smith', truck_type: 'Flatbed', jobDate: '2025-03-13', time: '10:30', selected: false }
    ];
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.assignmentsSubject.next(data);
      } else {
        // Initialize with default data
        this.saveToStorage(this.getInitialData());
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.assignmentsSubject.next(this.getInitialData());
    }
  }

  private saveToStorage(data: AssignmentData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getAllAssignments(): AssignmentData[] {
    return this.assignmentsSubject.value;
  }

  getAssignmentById(id: number): AssignmentData | undefined {
    return this.getAllAssignments().find(a => a.id === id);
  }

  updateAssignment(id: number, updates: Partial<AssignmentData>): void {
    const assignments = this.getAllAssignments();
    const index = assignments.findIndex(a => a.id === id);
    
    if (index !== -1) {
      assignments[index] = { ...assignments[index], ...updates };
      this.assignmentsSubject.next(assignments);
      this.saveToStorage(assignments);
    }
  }

  deleteAssignment(id: number): void {
    const assignments = this.getAllAssignments().filter(a => a.id !== id);
    this.assignmentsSubject.next(assignments);
    this.saveToStorage(assignments);
  }

  deleteAssignments(ids: number[]): void {
    const assignments = this.getAllAssignments().filter(a => !ids.includes(a.id!));
    this.assignmentsSubject.next(assignments);
    this.saveToStorage(assignments);
  }

  addAssignment(assignment: AssignmentData): void {
    const assignments = this.getAllAssignments();
    // Generate new ID if not provided
    if (!assignment.id) {
      const maxId = assignments.length > 0 ? Math.max(...assignments.map(a => a.id || 0)) : 0;
      assignment.id = maxId + 1;
    }
    assignments.push(assignment);
    this.assignmentsSubject.next(assignments);
    this.saveToStorage(assignments);
  }
}

