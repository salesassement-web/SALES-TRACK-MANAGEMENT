import { User, UserRole, SalesPerson, Evaluation, Task, TaskStatus, TaskPriority } from './types';

const CURRENT_DATE = new Date();
const CURRENT_MONTH = CURRENT_DATE.getMonth() + 1;
const CURRENT_YEAR = CURRENT_DATE.getFullYear();

export const DUMMY_SALES: SalesPerson[] = [
  // SUPERVISOR: NINA AFRIDA (KALBE)
  { id: 'S01', fullName: 'ANTO', principle: 'KALBE', supervisorName: 'NINA AFRIDA', joinDate: '2024-01-15', avatar: '' },
  { id: 'S02', fullName: 'BUDI', principle: 'KALBE', supervisorName: 'NINA AFRIDA', joinDate: '2024-02-20', avatar: '' },
  { id: 'S03', fullName: 'CITRA', principle: 'KALBE', supervisorName: 'NINA AFRIDA', joinDate: '2024-03-10', avatar: '' },
  { id: 'S04', fullName: 'DONO', principle: 'KALBE', supervisorName: 'NINA AFRIDA', joinDate: '2024-04-05', avatar: '' },
  { id: 'S05', fullName: 'EKA', principle: 'KALBE', supervisorName: 'NINA AFRIDA', joinDate: '2024-05-12', avatar: '' },

  // SUPERVISOR: SUNARIYANTO (UNILEVER)
  { id: 'S06', fullName: 'ANI', principle: 'UNILEVER', supervisorName: 'SUNARIYANTO', joinDate: '2024-01-10', avatar: '' },
  { id: 'S07', fullName: 'FAJAR', principle: 'UNILEVER', supervisorName: 'SUNARIYANTO', joinDate: '2024-02-15', avatar: '' },
  { id: 'S08', fullName: 'GITA', principle: 'UNILEVER', supervisorName: 'SUNARIYANTO', joinDate: '2024-03-20', avatar: '' },
  { id: 'S09', fullName: 'HADI', principle: 'UNILEVER', supervisorName: 'SUNARIYANTO', joinDate: '2024-04-25', avatar: '' },
  { id: 'S10', fullName: 'INDAH', principle: 'UNILEVER', supervisorName: 'SUNARIYANTO', joinDate: '2024-05-30', avatar: '' },

  // SUPERVISOR: WATI (KENVEU)
  { id: 'S11', fullName: 'ADNY', principle: 'KENVEU', supervisorName: 'WATI', joinDate: '2024-01-05', avatar: '' },
  { id: 'S12', fullName: 'JOKO', principle: 'KENVEU', supervisorName: 'WATI', joinDate: '2024-02-08', avatar: '' },
  { id: 'S13', fullName: 'KIKI', principle: 'KENVEU', supervisorName: 'WATI', joinDate: '2024-03-15', avatar: '' },
  { id: 'S14', fullName: 'LINA', principle: 'KENVEU', supervisorName: 'WATI', joinDate: '2024-04-22', avatar: '' },
  { id: 'S15', fullName: 'MIKO', principle: 'KENVEU', supervisorName: 'WATI', joinDate: '2024-05-18', avatar: '' },

  // SUPERVISOR: SHELA (PERFETTI)
  { id: 'S16', fullName: 'ANSYI', principle: 'PERFETTI', supervisorName: 'SHELA', joinDate: '2024-01-25', avatar: '' },
  { id: 'S17', fullName: 'NANDA', principle: 'PERFETTI', supervisorName: 'SHELA', joinDate: '2024-02-28', avatar: '' },
  { id: 'S18', fullName: 'OSCAR', principle: 'PERFETTI', supervisorName: 'SHELA', joinDate: '2024-03-12', avatar: '' },
  { id: 'S19', fullName: 'PUTRI', principle: 'PERFETTI', supervisorName: 'SHELA', joinDate: '2024-04-10', avatar: '' },
  { id: 'S20', fullName: 'QORI', principle: 'PERFETTI', supervisorName: 'SHELA', joinDate: '2024-05-05', avatar: '' },
];

export const DUMMY_USERS: User[] = [
  { id: 'U01', fullName: 'ADMIN USER', role: UserRole.ADMIN, principle: 'ALL SANCHO' },
  { id: 'U02', fullName: 'NINA AFRIDA', role: UserRole.SUPERVISOR, principle: 'KALBE' },
  { id: 'U03', fullName: 'ADM KASIR', role: UserRole.KASIR, principle: 'ALL PRINCIPLE' },
  { id: 'U04', fullName: 'HRD', role: UserRole.HRD, principle: 'ALL PRINCIPLE' },
  { id: 'U05', fullName: 'SUNARIYANTO', role: UserRole.SUPERVISOR, principle: 'UNILEVER' },
  { id: 'U06', fullName: 'WATI', role: UserRole.SUPERVISOR, principle: 'KENVEU' },
  { id: 'U07', fullName: 'SHELA', role: UserRole.SUPERVISOR, principle: 'PERFETTI' },
];

export const PRINCIPLES = [
  'KALBE', 'UNILEVER', 'KENVEU', 'PERFETTI', 'ALL SANCHO', 'ALL PRINCIPLE'
];

// Dummy Evaluations for the 3 rated sales per supervisor
// S01-S03, S06-S08, S11-S13, S16-S18 are rated.
// Mix of scores to create varied statuses (STAY/LEAVE)

export const DUMMY_EVALUATIONS: Evaluation[] = [
  // KALBE (S01 STAY, S02 STAY, S03 LEAVE)
  {
    salesId: 'S01', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 90, activeOutlet: 85, effectiveCall: 80, itemPerTrans: 85,
      akurasiSetoran: 90, sisaFaktur: 85, overdue: 90, updateSetoran: 95,
      absensi: 100, terlambat: 90, fingerScan: 95
    },
    finalScore: 88.85, status: 'STAY'
  },
  {
    salesId: 'S02', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 80, activeOutlet: 80, effectiveCall: 75, itemPerTrans: 70,
      akurasiSetoran: 85, sisaFaktur: 80, overdue: 75, updateSetoran: 80,
      absensi: 95, terlambat: 85, fingerScan: 90
    },
    finalScore: 80.15, status: 'STAY'
  },
  {
    salesId: 'S03', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 60, activeOutlet: 50, effectiveCall: 55, itemPerTrans: 60,
      akurasiSetoran: 70, sisaFaktur: 60, overdue: 65, updateSetoran: 70,
      absensi: 80, terlambat: 70, fingerScan: 75
    },
    finalScore: 63.5, status: 'LEAVE'
  },

  // UNILEVER (S06 STAY, S07 LEAVE, S08 STAY)
  {
    salesId: 'S06', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 95, activeOutlet: 90, effectiveCall: 90, itemPerTrans: 85,
      akurasiSetoran: 95, sisaFaktur: 90, overdue: 95, updateSetoran: 90,
      absensi: 100, terlambat: 100, fingerScan: 100
    },
    finalScore: 93.4, status: 'STAY'
  },
  {
    salesId: 'S07', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 50, activeOutlet: 55, effectiveCall: 50, itemPerTrans: 40,
      akurasiSetoran: 60, sisaFaktur: 50, overdue: 55, updateSetoran: 60,
      absensi: 90, terlambat: 80, fingerScan: 80
    },
    finalScore: 58.7, status: 'LEAVE'
  },
  {
    salesId: 'S08', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 85, activeOutlet: 85, effectiveCall: 80, itemPerTrans: 80,
      akurasiSetoran: 80, sisaFaktur: 85, overdue: 80, updateSetoran: 85,
      absensi: 100, terlambat: 95, fingerScan: 95
    },
    finalScore: 85.3, status: 'STAY'
  },

  // KENVEU (S11 STAY, S12 STAY, S13 STAY)
  {
    salesId: 'S11', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 80, activeOutlet: 80, effectiveCall: 80, itemPerTrans: 80,
      akurasiSetoran: 80, sisaFaktur: 80, overdue: 80, updateSetoran: 80,
      absensi: 80, terlambat: 80, fingerScan: 80
    },
    finalScore: 80.0, status: 'STAY'
  },
  {
    salesId: 'S12', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 90, activeOutlet: 85, effectiveCall: 85, itemPerTrans: 80,
      akurasiSetoran: 90, sisaFaktur: 85, overdue: 85, updateSetoran: 80,
      absensi: 95, terlambat: 90, fingerScan: 90
    },
    finalScore: 87.6, status: 'STAY'
  },
  {
    salesId: 'S13', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 78, activeOutlet: 75, effectiveCall: 70, itemPerTrans: 75,
      akurasiSetoran: 85, sisaFaktur: 80, overdue: 80, updateSetoran: 85,
      absensi: 90, terlambat: 85, fingerScan: 90
    },
    finalScore: 79.55, status: 'STAY'
  },

  // PERFETTI (S16 STAY, S17 STAY, S18 LEAVE)
  {
    salesId: 'S16', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 92, activeOutlet: 90, effectiveCall: 88, itemPerTrans: 85,
      akurasiSetoran: 90, sisaFaktur: 90, overdue: 90, updateSetoran: 90,
      absensi: 100, terlambat: 100, fingerScan: 100
    },
    finalScore: 91.3, status: 'STAY'
  },
  {
    salesId: 'S17', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 80, activeOutlet: 80, effectiveCall: 80, itemPerTrans: 80,
      akurasiSetoran: 80, sisaFaktur: 80, overdue: 80, updateSetoran: 80,
      absensi: 80, terlambat: 80, fingerScan: 80
    },
    finalScore: 80.0, status: 'STAY'
  },
  {
    salesId: 'S18', year: CURRENT_YEAR, month: CURRENT_MONTH,
    supervisorRated: true, kasirRated: true, hrdRated: true,
    scores: {
      sellOut: 40, activeOutlet: 50, effectiveCall: 40, itemPerTrans: 50,
      akurasiSetoran: 60, sisaFaktur: 60, overdue: 60, updateSetoran: 60,
      absensi: 80, terlambat: 70, fingerScan: 70
    },
    finalScore: 55.4, status: 'LEAVE'
  },
];

export const DUMMY_TASKS: Task[] = [
  // NINA AFRIDA - KALBE (U02)
  { id: '1', supervisorId: 'U02', title: 'Visit Toko Mitra 10', description: 'Survey stok dan display produk baru', taskDate: '2025-11-23', dueDate: '2025-11-25', priority: TaskPriority.MEDIUM, status: TaskStatus.OPEN, attachment: '' },
  { id: '2', supervisorId: 'U02', title: 'Meeting Tim Sales', description: 'Review performance bulan November', taskDate: '2025-11-23', dueDate: '2025-11-24', priority: TaskPriority.HIGH, status: TaskStatus.PENDING, timeIn: '09:00', attachment: '' },
  { id: '3', supervisorId: 'U02', title: 'Follow Up Client ABC', description: 'Telepon Pak Bambang untuk order', taskDate: '2025-11-22', dueDate: '2025-11-23', priority: TaskPriority.MEDIUM, status: TaskStatus.ONGOING, timeIn: '10:00', timeOut: '14:00', attachment: '' },
  { id: '4', supervisorId: 'U02', title: 'Training Produk Baru', description: 'Pelatihan product knowledge untuk tim', taskDate: '2025-11-24', dueDate: '2025-11-26', priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED, attachment: '' },
  { id: '5', supervisorId: 'U02', title: 'Visit ACE Hardware Senayan', description: 'Check kompetitor pricing dan promo', taskDate: '2025-11-21', dueDate: '2025-11-23', priority: TaskPriority.LOW, status: TaskStatus.COMPLETED, timeIn: '08:00', timeOut: '12:00', attachment: 'https://via.placeholder.com/150' },

  // SUNARIYANTO - UNILEVER (U05)
  { id: '6', supervisorId: 'U05', title: 'Audit Stock Unilever', description: 'Check inventory produk Unilever di gudang', taskDate: '2025-11-23', dueDate: '2025-11-24', priority: TaskPriority.HIGH, status: TaskStatus.ONGOING, timeIn: '08:00', attachment: '' },
  { id: '7', supervisorId: 'U05', title: 'Presentasi ke Alfamart', description: 'Tawarkan produk baru ke buyer Alfamart', taskDate: '2025-11-22', dueDate: '2025-11-23', priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED, timeIn: '10:00', timeOut: '15:00', attachment: '' },
  { id: '8', supervisorId: 'U05', title: 'Survey Pasar Modern', description: 'Cek harga kompetitor di supermarket', taskDate: '2025-11-24', dueDate: '2025-11-26', priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, attachment: '' },
  { id: '9', supervisorId: 'U05', title: 'Meeting Regional Manager', description: 'Diskusi strategi Q1 2026', taskDate: '2025-11-25', dueDate: '2025-11-27', priority: TaskPriority.HIGH, status: TaskStatus.OPEN, attachment: '' },
  { id: '10', supervisorId: 'U05', title: 'Training Team Selling Skills', description: 'Pelatihan teknik penjualan untuk sales team', taskDate: '2025-11-26', dueDate: '2025-11-28', priority: TaskPriority.MEDIUM, status: TaskStatus.COMPLETED, attachment: '' },

  // WATI - KENVEU (U06)
  { id: '11', supervisorId: 'U06', title: 'Visit Distributor Utama', description: 'Follow up payment dan order baru', taskDate: '2025-11-23', dueDate: '2025-11-24', priority: TaskPriority.HIGH, status: TaskStatus.ONGOING, timeIn: '09:00', attachment: '' },
  { id: '12', supervisorId: 'U06', title: 'Laporan Mingguan', description: 'Submit weekly sales report ke management', taskDate: '2025-11-22', dueDate: '2025-11-22', priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED, timeIn: '14:00', timeOut: '16:00', attachment: '' },
  { id: '13', supervisorId: 'U06', title: 'Coaching Sales Junior', description: 'Mentoring 2 sales baru tentang product knowledge', taskDate: '2025-11-24', dueDate: '2025-11-25', priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, attachment: '' },
  { id: '14', supervisorId: 'U06', title: 'Analisa Kompetitor', description: 'Research produk dan harga kompetitor brand sejenis', taskDate: '2025-11-25', dueDate: '2025-11-27', priority: TaskPriority.LOW, status: TaskStatus.OPEN, attachment: '' },

  // SHELA - PERFETTI (U07)
  { id: '15', supervisorId: 'U07', title: 'Roadshow Produk Baru', description: 'Event launching produk Perfetti di mall', taskDate: '2025-11-23', dueDate: '2025-11-24', priority: TaskPriority.HIGH, status: TaskStatus.ONGOING, timeIn: '10:00', attachment: '' },
  { id: '16', supervisorId: 'U07', title: 'Negosiasi Harga Indomaret', description: 'Diskusi kontrak supply ke Indomaret', taskDate: '2025-11-22', dueDate: '2025-11-23', priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED, timeIn: '11:00', timeOut: '14:00', attachment: '' },
  { id: '17', supervisorId: 'U07', title: 'Review Target Bulanan', description: 'Evaluasi pencapaian sales vs target November', taskDate: '2025-11-24', dueDate: '2025-11-25', priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, attachment: '' },
  { id: '18', supervisorId: 'U07', title: 'Visit Toko Ritel Kecil', description: 'Survey dan stock check ke 10 toko retail', taskDate: '2025-11-25', dueDate: '2025-11-26', priority: TaskPriority.LOW, status: TaskStatus.OPEN, attachment: '' },
  { id: '19', supervisorId: 'U07', title: 'Briefing Tim Mingguan', description: 'Weekly meeting dengan seluruh sales team', taskDate: '2025-11-26', dueDate: '2025-11-26', priority: TaskPriority.MEDIUM, status: TaskStatus.COMPLETED, attachment: '' },
];