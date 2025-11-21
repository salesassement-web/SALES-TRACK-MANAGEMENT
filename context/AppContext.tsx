import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, SalesPerson, Evaluation, UserRole, ScoreData, Task, TaskStatus, TaskPriority, AppConfig, KPIConfiguration, DEFAULT_KPI_CONFIG, KPICriteria } from '../types';
import { DUMMY_SALES, DUMMY_USERS, PRINCIPLES as INITIAL_PRINCIPLES, DUMMY_EVALUATIONS } from '../constants';

interface AppContextType {
  currentUser: User | null;
  salesList: SalesPerson[];
  usersList: User[];
  evaluations: Evaluation[];
  principles: string[];
  tasks: Task[];
  
  // Configuration
  appConfig: AppConfig;
  kpiConfig: KPIConfiguration;
  updateAppConfig: (config: Partial<AppConfig>) => void;
  updateKPIConfig: (config: KPIConfiguration) => void;

  // Auth
  login: (role: UserRole, principle: string, name?: string) => void;
  logout: () => void;
  
  // Evaluation Logic
  updateScore: (salesId: string, month: number, year: number, scores: Partial<ScoreData>) => void;
  getEvaluation: (salesId: string, month: number, year: number) => Evaluation | undefined;

  // User CRUD
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;

  // Sales CRUD
  addSalesPerson: (sales: Omit<SalesPerson, 'id'>) => void;
  updateSalesPerson: (sales: SalesPerson) => void;
  deleteSalesPerson: (id: string) => void;

  // Principle CRUD
  addPrinciple: (name: string) => void;
  deletePrinciple: (name: string) => void;

  // Task CRUD
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TODAY = new Date().toISOString().split('T')[0];
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split('T')[0];

// Dummy Tasks (Kept same as before)
const DUMMY_TASKS: Task[] = [
  {
    id: 'T_KALBE_01', supervisorId: 'U02', title: 'Kunjungan Outlet Platinum', description: 'Cek display produk dan stok buffer di area Selatan.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.HIGH, status: TaskStatus.ONGOING, timeIn: '08:30', timeOut: '10:00'
  },
  {
    id: 'T_KALBE_02', supervisorId: 'U02', title: 'Monitoring Promo Harian', description: 'Pastikan materi promo terpasang di rak utama.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.MEDIUM, status: TaskStatus.ONGOING, timeIn: '10:30', timeOut: '11:45'
  },
  {
    id: 'T_KALBE_03', supervisorId: 'U02', title: 'Coaching Sales Junior', description: 'Sesi one-on-one dengan tim baru mengenai product knowledge.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, timeIn: '13:00'
  },
  {
    id: 'T_KALBE_04', supervisorId: 'U02', title: 'Rekapitulasi Sales Mingguan', description: 'Input data penjualan manual ke sistem pusat.',
    taskDate: TODAY, dueDate: TOMORROW, priority: TaskPriority.LOW, status: TaskStatus.PENDING, timeIn: '14:15'
  },
  {
    id: 'T_KALBE_05', supervisorId: 'U02', title: 'Meeting Prinsipal Kalbe', description: 'Review target Q3 bersama tim pusat.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED, 
    timeIn: '09:00', timeOut: '11:00', attachment: 'https://ui-avatars.com/api/?name=Meeting&background=0D8ABC&color=fff', approvalStatus: 'APPROVED'
  },
  {
    id: 'T_UNI_01', supervisorId: 'U05', title: 'Audit Stok Gudang Distributor', description: 'Verifikasi fisik stok barang slow moving.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.HIGH, status: TaskStatus.ONGOING, timeIn: '08:00', timeOut: '12:00'
  },
  {
    id: 'T_UNI_02', supervisorId: 'U05', title: 'Survey Kompetitor', description: 'Cek harga dan promo kompetitor di 5 outlet besar.',
    taskDate: TODAY, dueDate: TOMORROW, priority: TaskPriority.MEDIUM, status: TaskStatus.ONGOING, timeIn: '13:00', timeOut: '14:30'
  },
  {
    id: 'T_UNI_03', supervisorId: 'U05', title: 'Briefing Pagi Tim Unilever', description: 'Motivasi dan pembagian rute harian.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.HIGH, status: TaskStatus.PENDING, timeIn: '07:30'
  },
  {
    id: 'T_UNI_04', supervisorId: 'U05', title: 'Validasi Faktur Bermasalah', description: 'Follow up toko yang memiliki retur gantung.',
    taskDate: TODAY, dueDate: TOMORROW, priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, timeIn: '15:00'
  },
  {
    id: 'T_UNI_05', supervisorId: 'U05', title: 'Laporan Stock Opname', description: 'Finalisasi laporan SO bulan lalu.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.MEDIUM, status: TaskStatus.COMPLETED,
    timeIn: '16:00', timeOut: '17:00', attachment: 'https://ui-avatars.com/api/?name=Report&background=random', approvalStatus: 'WAITING'
  },
  {
    id: 'T_KEN_01', supervisorId: 'U06', title: 'Kunjungan Modern Trade', description: 'Meeting dengan Store Manager Hypermart.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.HIGH, status: TaskStatus.ONGOING, timeIn: '10:00', timeOut: '11:30'
  },
  {
    id: 'T_KEN_02', supervisorId: 'U06', title: 'Cek Planogram Rak', description: 'Pastikan susunan produk sesuai standar Kenveu.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.LOW, status: TaskStatus.ONGOING, timeIn: '13:00', timeOut: '13:45'
  },
  {
    id: 'T_KEN_03', supervisorId: 'U06', title: 'Training Product Baru', description: 'Sosialisasi SKU baru ke tim SPG.',
    taskDate: TODAY, dueDate: TOMORROW, priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, timeIn: '14:00'
  },
  {
    id: 'T_KEN_04', supervisorId: 'U06', title: 'Review Piutang Toko', description: 'Koordinasi dengan admin AR untuk toko overdue.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.HIGH, status: TaskStatus.PENDING, timeIn: '09:00'
  },
  {
    id: 'T_KEN_05', supervisorId: 'U06', title: 'Event Booth Activity', description: 'Setup booth untuk event weekend.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED,
    timeIn: '08:00', timeOut: '10:00', attachment: 'https://ui-avatars.com/api/?name=Event&background=ff0000&color=fff', approvalStatus: 'APPROVED'
  },
  {
    id: 'T_PER_01', supervisorId: 'U07', title: 'Distribusi POSM Material', description: 'Membagikan poster dan wobbler ke outlet binaan.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.MEDIUM, status: TaskStatus.ONGOING, timeIn: '09:30', timeOut: '11:00'
  },
  {
    id: 'T_PER_02', supervisorId: 'U07', title: 'Monitoring Salesman GT', description: 'Join visit dengan salesman area pasar tradisional.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.HIGH, status: TaskStatus.ONGOING, timeIn: '07:00', timeOut: '09:00'
  },
  {
    id: 'T_PER_03', supervisorId: 'U07', title: 'Analisa Penjualan Permen', description: 'Evaluasi drop size per outlet.',
    taskDate: TODAY, dueDate: TOMORROW, priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, timeIn: '13:30'
  },
  {
    id: 'T_PER_04', supervisorId: 'U07', title: 'Koordinasi Logistik', description: 'Pastikan pengiriman barang promo tepat waktu.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.LOW, status: TaskStatus.PENDING, timeIn: '15:00'
  },
  {
    id: 'T_PER_05', supervisorId: 'U07', title: 'Gathering Toko Pareto', description: 'Makan siang bersama pemilik toko top 10.',
    taskDate: TODAY, dueDate: TODAY, priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED,
    timeIn: '12:00', timeOut: '14:00', attachment: 'https://ui-avatars.com/api/?name=Lunch&background=00ff00&color=fff', approvalStatus: 'REJECTED'
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [salesList, setSalesList] = useState<SalesPerson[]>(DUMMY_SALES);
  const [usersList, setUsersList] = useState<User[]>(DUMMY_USERS);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(DUMMY_EVALUATIONS);
  const [principles, setPrinciples] = useState<string[]>(INITIAL_PRINCIPLES);
  const [tasks, setTasks] = useState<Task[]>(DUMMY_TASKS);

  // --- SETTINGS STATE ---
  const [appConfig, setAppConfig] = useState<AppConfig>({
    appName: 'SALES MANAGEMENT TRACKER',
    themeColor: 'blue'
  });
  const [kpiConfig, setKpiConfig] = useState<KPIConfiguration>(DEFAULT_KPI_CONFIG);

  const updateAppConfig = (config: Partial<AppConfig>) => {
    setAppConfig(prev => ({ ...prev, ...config }));
  };

  const updateKPIConfig = (config: KPIConfiguration) => {
    setKpiConfig(config);
  };

  const login = (role: UserRole, principle: string, name?: string) => {
    const user = usersList.find(u => {
      if (role === UserRole.SUPERVISOR) {
        return u.role === role && u.fullName === name;
      }
      return u.role === role && (u.role === UserRole.ADMIN ? true : u.principle === principle || u.principle === 'ALL PRINCIPLE');
    });
    
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser({
        id: 'temp_' + Date.now(),
        fullName: name || role,
        role,
        principle
      });
    }
  };

  const logout = () => setCurrentUser(null);

  // --- Dynamic Calculation Logic ---
  const calculateFinalScore = (scores: ScoreData): { score: number, status: 'LEAVE' | 'STAY' | 'PENDING' } => {
    const calculateSectionScore = (section: 'supervisor' | 'kasir' | 'hrd') => {
        const config = kpiConfig[section];
        let rawScore = 0;
        
        config.criteria.forEach(c => {
            const val = scores[c.key] || 0;
            rawScore += val * c.weight;
        });

        return rawScore * config.totalWeight;
    };

    const spvScore = calculateSectionScore('supervisor');
    const kasirScore = calculateSectionScore('kasir');
    const hrdScore = calculateSectionScore('hrd');

    const totalWeightedScore = spvScore + kasirScore + hrdScore;
    const status = totalWeightedScore >= 75 ? 'STAY' : 'LEAVE';

    return { score: totalWeightedScore, status };
  };

  const updateScore = (salesId: string, month: number, year: number, newScores: Partial<ScoreData>) => {
    setEvaluations(prev => {
      const existingIndex = prev.findIndex(e => e.salesId === salesId && e.month === month && e.year === year);
      
      let updatedEvaluation: Evaluation;

      // Helper to check if all keys in a section are present
      const checkSectionComplete = (section: 'supervisor' | 'kasir' | 'hrd', scores: Partial<ScoreData>) => {
          return kpiConfig[section].criteria.every(c => scores[c.key] !== undefined && scores[c.key] !== null);
      };

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updatedScores = { ...existing.scores, ...newScores };
        const { score, status } = calculateFinalScore(updatedScores);
        
        const spvComplete = checkSectionComplete('supervisor', updatedScores);
        const kasirComplete = checkSectionComplete('kasir', updatedScores);
        const hrdComplete = checkSectionComplete('hrd', updatedScores);

        updatedEvaluation = {
          ...existing,
          scores: updatedScores,
          supervisorRated: existing.supervisorRated || spvComplete,
          kasirRated: existing.kasirRated || kasirComplete,
          hrdRated: existing.hrdRated || hrdComplete,
          finalScore: parseFloat(score.toFixed(2)),
          status: (spvComplete && kasirComplete && hrdComplete) ? status : 'PENDING'
        };

        const newEvaluations = [...prev];
        newEvaluations[existingIndex] = updatedEvaluation;
        return newEvaluations;
      } else {
        const updatedScores = { ...newScores };
        const { score, status } = calculateFinalScore(updatedScores);
        updatedEvaluation = {
          salesId,
          month,
          year,
          scores: updatedScores,
          supervisorRated: false,
          kasirRated: false,
          hrdRated: false,
          finalScore: parseFloat(score.toFixed(2)),
          status: 'PENDING'
        };
        return [...prev, updatedEvaluation];
      }
    });
  };

  const getEvaluation = (salesId: string, month: number, year: number) => {
    return evaluations.find(e => e.salesId === salesId && e.month === month && e.year === year);
  };

  // --- CRUD Operations (Unchanged) ---
  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: `U${Date.now()}` };
    setUsersList(prev => [...prev, newUser]);
  };
  const updateUser = (updatedUser: User) => {
    setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };
  const deleteUser = (id: string) => {
    setUsersList(prev => prev.filter(u => u.id !== id));
  };
  const addSalesPerson = (sales: Omit<SalesPerson, 'id'>) => {
    const newSales = { ...sales, id: `S${Date.now()}` };
    setSalesList(prev => [...prev, newSales]);
  };
  const updateSalesPerson = (updatedSales: SalesPerson) => {
    setSalesList(prev => prev.map(s => s.id === updatedSales.id ? updatedSales : s));
  };
  const deleteSalesPerson = (id: string) => {
    setSalesList(prev => prev.filter(s => s.id !== id));
  };
  const addPrinciple = (name: string) => {
    if (!principles.includes(name)) {
      setPrinciples(prev => [...prev, name]);
    }
  };
  const deletePrinciple = (name: string) => {
    setPrinciples(prev => prev.filter(p => p !== name));
  };
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: `T${Date.now()}` };
    setTasks(prev => [...prev, newTask]);
  };
  const updateTask = (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, salesList, usersList, evaluations, principles, tasks,
      appConfig, kpiConfig, updateAppConfig, updateKPIConfig,
      login, logout, updateScore, getEvaluation,
      addUser, updateUser, deleteUser,
      addSalesPerson, updateSalesPerson, deleteSalesPerson,
      addPrinciple, deletePrinciple,
      addTask, updateTask
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};