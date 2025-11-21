export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  KASIR = 'KASIR',
  HRD = 'HRD',
}

export interface User {
  id: string;
  fullName: string;
  role: UserRole;
  principle: string;
  supervisorId?: string; 
  joinDate?: string;
  avatar?: string;
}

export interface SalesPerson {
  id: string;
  fullName: string;
  principle: string;
  supervisorName: string;
  joinDate: string;
  avatar: string;
}

export interface ScoreData {
  // Supervisor
  sellOut?: number;
  activeOutlet?: number;
  effectiveCall?: number;
  itemPerTrans?: number;

  // Kasir
  akurasiSetoran?: number;
  sisaFaktur?: number;
  overdue?: number;
  updateSetoran?: number;

  // HRD
  absensi?: number;
  terlambat?: number;
  fingerScan?: number;
}

export interface Evaluation {
  salesId: string;
  year: number;
  month: number;
  scores: ScoreData;
  supervisorRated: boolean;
  kasirRated: boolean;
  hrdRated: boolean;
  finalScore: number;
  status: 'STAY' | 'LEAVE' | 'PENDING';
}

export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum TaskStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id: string;
  supervisorId: string;
  title: string;
  description: string;
  taskDate: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  timeIn?: string;
  timeOut?: string;
  attachment?: string;
  approvalStatus?: 'APPROVED' | 'REJECTED' | 'WAITING';
}

// --- CONFIGURATION TYPES ---

export type ThemeColor = 'blue' | 'emerald' | 'red' | 'indigo' | 'violet' | 'orange' | 'cyan';

export interface AppConfig {
  appName: string;
  themeColor: ThemeColor;
}

export interface KPICriteria {
  key: keyof ScoreData;
  label: string;
  weight: number; // 0.0 - 1.0
}

export interface KPISection {
  role: UserRole; // Who inputs this
  label: string; // Display Name (e.g. "Supervisor Weight")
  totalWeight: number; // Category weight (e.g. 0.4 for 40%)
  criteria: KPICriteria[];
}

export interface KPIConfiguration {
  supervisor: KPISection;
  kasir: KPISection;
  hrd: KPISection;
}

// Default Configs
export const DEFAULT_KPI_CONFIG: KPIConfiguration = {
  supervisor: {
    role: UserRole.SUPERVISOR,
    label: 'SUPERVISOR WEIGHT',
    totalWeight: 0.40,
    criteria: [
      { key: 'sellOut', label: 'SELL OUT', weight: 0.35 },
      { key: 'activeOutlet', label: 'ACTIVE OUTLET', weight: 0.30 },
      { key: 'effectiveCall', label: 'EFFECTIVE CALL', weight: 0.25 },
      { key: 'itemPerTrans', label: 'ITEM PER TRANSAKSI', weight: 0.15 }
    ]
  },
  kasir: {
    role: UserRole.KASIR,
    label: 'ADM KASIR WEIGHT',
    totalWeight: 0.40,
    criteria: [
      { key: 'akurasiSetoran', label: 'AKURASI SETORAN A1', weight: 0.35 },
      { key: 'sisaFaktur', label: 'SISA FAKTUR TERTAGIH', weight: 0.25 },
      { key: 'overdue', label: 'OVERDUE', weight: 0.25 },
      { key: 'updateSetoran', label: 'UPDATE SETORAN TF', weight: 0.15 }
    ]
  },
  hrd: {
    role: UserRole.HRD,
    label: 'HRD WEIGHT',
    totalWeight: 0.20,
    criteria: [
      { key: 'absensi', label: 'ABSENSI', weight: 0.50 },
      { key: 'terlambat', label: 'TERLAMBAT', weight: 0.25 },
      { key: 'fingerScan', label: 'FINGER SCAN TIME IN/OUT', weight: 0.25 }
    ]
  }
};