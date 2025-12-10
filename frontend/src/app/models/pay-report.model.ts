// src/app/pages/pay-reports/models/pay-report.model.ts
export interface PayReportHeader {
    id: number;
    driverId: number;
    driverName: string;
    weekStart: string;   // "YYYY-MM-DD"
    weekEnd: string;     // "YYYY-MM-DD"
    totalWeightOrHours: number;
    totalTruckPaid: number;
    totalAmount: number;
    totalDue: number;
    fuelProgram?: number;
    fuelPilotOrKT?: number;
    fuelSurcharge?: number;
  }
  
  export interface PayReportLine {
    id: number;
    date: string;                // "YYYY-MM-DD"
    truckNumber: string;         // e.g., "M77"
    trailerNumber?: string;      // e.g., "1635"
    jobNumber: string;           // e.g., "25-3270"
    loaded: string;
    unloaded: string;
    weightOrHour: number;
    truckPaid: number;
    total: number;
    trailerRent?: number;
    brokerCharge?: number;
    contractorPaid?: number;
  }
  
  export interface PayReport extends PayReportHeader {
    lines: PayReportLine[];
  }
  