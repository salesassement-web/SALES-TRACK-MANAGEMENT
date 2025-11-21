import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Evaluation } from './pages/Evaluation';
import { AdminUsers } from './pages/AdminUsers';
import { AdminSupervisors } from './pages/AdminSupervisors';
import { AdminPrinciples } from './pages/AdminPrinciples';
import { AdminSales } from './pages/AdminSales';
import { AdminTasks } from './pages/AdminTasks';
import { AdminSettings } from './pages/AdminSettings';
import { AdminExport } from './pages/AdminExport';
import { MyTasks } from './pages/MyTasks';
import { Sidebar } from './components/Sidebar';
import { UserRole } from './types';
import { Menu } from 'lucide-react';
import { Avatar } from './components/Avatar';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { currentUser } = useApp();
  
  if (!currentUser) return <Navigate to="/" replace />;
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Layout Wrapper
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { appConfig, currentUser } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isPublicPage = location.pathname === '/' || location.pathname === '/register';

  if (isPublicPage) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative main-container">
      
      {/* 1. Global App Header - Always Visible on Top (Hidden in Print) */}
      <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-4 shadow-md sticky top-0 z-40 app-header no-print">
         <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Open Menu"
             >
                <Menu size={24} />
             </button>
             <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-none">{appConfig.appName}</span>
                <span className="text-[10px] text-slate-400 tracking-wide">PERFORMANCE SYSTEM</span>
             </div>
         </div>
         
         {/* Desktop User Profile */}
         <div className="hidden md:flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setIsSidebarOpen(true)}>
                <div className="text-right hidden lg:block">
                   <p className="text-sm font-bold leading-none">{currentUser.fullName}</p>
                   <p className="text-xs text-slate-400 leading-none mt-1">{currentUser.role}</p>
                </div>
                <Avatar src={currentUser.avatar} name={currentUser.fullName} className="w-9 h-9 border border-slate-600 shadow-sm" />
              </div>
            )}
         </div>
      </header>

      {/* 2. Sidebar Drawer (Overlay) - Completely separate from flow (Hidden in Print) */}
      <div className="sidebar-wrapper no-print">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      {/* 3. Main Content - Full Width, No Margins */}
      <div className="flex-1 w-full relative">
         <main className="w-full max-w-7xl mx-auto p-4 md:p-8 min-h-[calc(100vh-64px)] print:p-0 print:max-w-full print:m-0">
           {children}
         </main>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/my-tasks" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPERVISOR]}>
              <MyTasks />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/tasks" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminTasks />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/evaluation" 
          element={
            <ProtectedRoute>
              <Evaluation />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminUsers />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/supervisors" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminSupervisors />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/principles" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminPrinciples />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/sales" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminSales />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminSettings />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/export" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminExport />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;