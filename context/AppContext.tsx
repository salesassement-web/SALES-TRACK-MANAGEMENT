
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, SalesPerson, Evaluation, UserRole, ScoreData, Task, TaskStatus, TaskPriority, AppConfig, KPIConfiguration, DEFAULT_KPI_CONFIG, KPICriteria } from '../types';
import { DUMMY_SALES, DUMMY_USERS, PRINCIPLES as INITIAL_PRINCIPLES, DUMMY_EVALUATIONS, DUMMY_TASKS } from '../constants';
import { googleSheetService } from '../services/googleSheetService';

// ENABLE GOOGLE SHEETS INTEGRATION
const USE_GOOGLE_SHEETS = true; // Enabled for live data sync

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

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

  // Data Sync
  isLoading: boolean;
  connectionStatus: ConnectionStatus;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initial Data (Starts with Dummy, replaced if Sheets is active)
  const [salesList, setSalesList] = useState<SalesPerson[]>(DUMMY_SALES);
  const [usersList, setUsersList] = useState<User[]>(DUMMY_USERS);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(DUMMY_EVALUATIONS);
  const [principles, setPrinciples] = useState<string[]>(INITIAL_PRINCIPLES);
  const [tasks, setTasks] = useState<Task[]>(DUMMY_TASKS);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');

  // --- SETTINGS STATE ---
  const [appConfig, setAppConfig] = useState<AppConfig>({
    appName: 'SALES MANAGEMENT TRACKER',
    themeColor: 'blue'
  });
  const [kpiConfig, setKpiConfig] = useState<KPIConfiguration>(DEFAULT_KPI_CONFIG);

  // Function to fetch data from Google Sheets
  const refreshData = async () => {
    if (!USE_GOOGLE_SHEETS) return;

    setIsLoading(true);
    setConnectionStatus('CONNECTING');
    try {
      const data = await googleSheetService.getAllData();
      if (data) {
        console.log("Data synced from Google Sheets:", data);

        // Only update state if data exists to avoid wiping dummy data with empty arrays on error
        if (data.users && data.users.length > 0) setUsersList(data.users);
        if (data.sales && data.sales.length > 0) setSalesList(data.sales);
        if (data.evaluations && data.evaluations.length > 0) setEvaluations(data.evaluations);
        if (data.tasks && data.tasks.length > 0) setTasks(data.tasks);
        if (data.principles && data.principles.length > 0) setPrinciples(data.principles);

        setConnectionStatus('CONNECTED');
      } else {
        // If null returned, it might be error or empty
        setConnectionStatus('ERROR');
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setConnectionStatus('ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    console.log("[AppContext] useEffect running, USE_GOOGLE_SHEETS:", USE_GOOGLE_SHEETS);
    if (USE_GOOGLE_SHEETS) {
      console.log("[AppContext] Calling refreshData...");
      refreshData();
    }
  }, []);

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

    // Ensure data is fresh from Google Sheets upon login
    if (USE_GOOGLE_SHEETS) {
      refreshData();
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
    // 1. Calculate updated evaluation based on current state
    const existingIndex = evaluations.findIndex(e => e.salesId === salesId && e.month === month && e.year === year);
    let updatedEvaluation: Evaluation;

    const checkSectionComplete = (section: 'supervisor' | 'kasir' | 'hrd', scores: Partial<ScoreData>) => {
      return kpiConfig[section].criteria.every(c => scores[c.key] !== undefined && scores[c.key] !== null);
    };

    if (existingIndex >= 0) {
      const existing = evaluations[existingIndex];
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
    } else {
      const updatedScores = { ...newScores };
      const { score, status } = calculateFinalScore(updatedScores);

      // Check if sections are complete (for new evaluation, likely false unless all data provided at once)
      const spvComplete = checkSectionComplete('supervisor', updatedScores);
      const kasirComplete = checkSectionComplete('kasir', updatedScores);
      const hrdComplete = checkSectionComplete('hrd', updatedScores);

      updatedEvaluation = {
        salesId,
        month,
        year,
        scores: updatedScores,
        supervisorRated: spvComplete,
        kasirRated: kasirComplete,
        hrdRated: hrdComplete,
        finalScore: parseFloat(score.toFixed(2)),
        status: (spvComplete && kasirComplete && hrdComplete) ? status : 'PENDING'
      };
    }

    // 2. Update State
    setEvaluations(prev => {
      const idx = prev.findIndex(e => e.salesId === salesId && e.month === month && e.year === year);
      if (idx >= 0) {
        const newArr = [...prev];
        newArr[idx] = updatedEvaluation;
        return newArr;
      } else {
        return [...prev, updatedEvaluation];
      }
    });

    // 3. Save to Google Sheets (Side Effect)
    if (USE_GOOGLE_SHEETS) {
      googleSheetService.saveEvaluation(updatedEvaluation);
    }
  };

  const getEvaluation = (salesId: string, month: number, year: number) => {
    return evaluations.find(e => e.salesId === salesId && e.month === month && e.year === year);
  };

  // --- CRUD Operations ---
  const addUser = (user: Omit<User, 'id'>) => {
    // Generate sequential ID: U01, U02, U03, etc.
    const getNextUserId = (): string => {
      if (usersList.length === 0) return 'U01';
      const userNumbers = usersList
        .map(u => {
          const match = u.id.match(/^U(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);
      const maxNumber = userNumbers.length > 0 ? Math.max(...userNumbers) : 0;
      return `U${(maxNumber + 1).toString().padStart(2, '0')}`;
    };
    const newUser = { ...user, id: getNextUserId() };
    setUsersList(prev => [...prev, newUser]);
    if (USE_GOOGLE_SHEETS) googleSheetService.saveUser(newUser);
  };
  const updateUser = (updatedUser: User) => {
    setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (USE_GOOGLE_SHEETS) googleSheetService.saveUser(updatedUser);
  };
  const deleteUser = (id: string) => {
    setUsersList(prev => prev.filter(u => u.id !== id));
    if (USE_GOOGLE_SHEETS) googleSheetService.deleteUser(id);
  };
  const addSalesPerson = (sales: Omit<SalesPerson, 'id'>) => {
    // Generate sequential ID: S01, S02, S03, etc.
    const getNextSalesId = (): string => {
      if (salesList.length === 0) return 'S01';
      const salesNumbers = salesList
        .map(s => {
          const match = s.id.match(/^S(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);
      const maxNumber = salesNumbers.length > 0 ? Math.max(...salesNumbers) : 0;
      return `S${(maxNumber + 1).toString().padStart(2, '0')}`;
    };
    const newSales = { ...sales, id: getNextSalesId() };
    setSalesList(prev => [...prev, newSales]);
    if (USE_GOOGLE_SHEETS) googleSheetService.saveSalesPerson(newSales);
  };
  const updateSalesPerson = (updatedSales: SalesPerson) => {
    setSalesList(prev => prev.map(s => s.id === updatedSales.id ? updatedSales : s));
    if (USE_GOOGLE_SHEETS) googleSheetService.saveSalesPerson(updatedSales);
  };
  const deleteSalesPerson = (id: string) => {
    setSalesList(prev => prev.filter(s => s.id !== id));
    if (USE_GOOGLE_SHEETS) googleSheetService.deleteSalesPerson(id);
  };
  const addPrinciple = (name: string) => {
    if (!principles.includes(name)) {
      setPrinciples(prev => [...prev, name]);
      if (USE_GOOGLE_SHEETS) googleSheetService.addPrinciple(name);
    }
  };
  const deletePrinciple = (name: string) => {
    setPrinciples(prev => prev.filter(p => p !== name));
    if (USE_GOOGLE_SHEETS) googleSheetService.deletePrinciple(name);
  };
  const addTask = (task: Omit<Task, 'id'>) => {
    // Generate sequential ID: T01, T02, T03, etc.
    const getNextTaskId = (): string => {
      if (tasks.length === 0) return 'T01';

      // Extract numeric part from existing task IDs
      const taskNumbers = tasks
        .map(t => {
          const match = t.id.match(/^T(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);

      // Get max number and increment
      const maxNumber = taskNumbers.length > 0 ? Math.max(...taskNumbers) : 0;
      const nextNumber = maxNumber + 1;

      // Format with leading zeros (minimum 2 digits)
      return `T${nextNumber.toString().padStart(2, '0')}`;
    };

    const newTask = { ...task, id: getNextTaskId() };
    setTasks(prev => [...prev, newTask]);
    if (USE_GOOGLE_SHEETS) googleSheetService.saveTask(newTask);
  };
  const updateTask = (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    if (USE_GOOGLE_SHEETS) googleSheetService.saveTask(task);
  };

  return (
    <AppContext.Provider value={{
      currentUser, salesList, usersList, evaluations, principles, tasks, isLoading, connectionStatus,
      appConfig, kpiConfig, updateAppConfig, updateKPIConfig,
      login, logout, updateScore, getEvaluation,
      addUser, updateUser, deleteUser,
      addSalesPerson, updateSalesPerson, deleteSalesPerson,
      addPrinciple, deletePrinciple,
      addTask, updateTask,
      refreshData
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
