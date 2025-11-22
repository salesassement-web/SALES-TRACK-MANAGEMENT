
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, FileText, LogOut, Briefcase, Users, UserCog, Layers, X, CheckSquare, ClipboardList, Settings, DatabaseBackup, Shield, Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import { Avatar } from './Avatar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout, appConfig, connectionStatus, refreshData, isLoading } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Always close sidebar after click on mobile AND desktop since it's a drawer
  };

  // Dynamic Color Classes construction
  const getThemeClass = (isActive: boolean) => {
    const colorMap: Record<string, string> = {
      blue: isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
      emerald: isActive ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
      red: isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
      indigo: isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
      violet: isActive ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
      orange: isActive ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
      cyan: isActive ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
    };
    return `flex items-center p-3 mb-2 rounded-lg transition-colors cursor-pointer ${colorMap[appConfig.themeColor] || colorMap.blue}`;
  };

  const getGradientText = () => {
    const map: Record<string, string> = {
      blue: 'from-blue-400 to-cyan-400',
      emerald: 'from-emerald-400 to-green-400',
      red: 'from-red-400 to-orange-400',
      indigo: 'from-indigo-400 to-purple-400',
      violet: 'from-violet-400 to-fuchsia-400',
      orange: 'from-orange-400 to-yellow-400',
      cyan: 'from-cyan-400 to-blue-400'
    };
    return `text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${map[appConfig.themeColor] || map.blue}`;
  };

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-900 mb-4">
            <Wifi size={14} />
            <span>Online & Synced</span>
          </div>
        );
      case 'CONNECTING':
        return (
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-950/50 px-3 py-1.5 rounded-full border border-blue-900 mb-4">
            <Loader2 size={14} className="animate-spin" />
            <span>Connecting...</span>
          </div>
        );
      case 'ERROR':
        return (
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-950/50 px-3 py-1.5 rounded-full border border-red-900 mb-4">
            <WifiOff size={14} />
            <span>Sync Error</span>
          </div>
        );
      default: // DISCONNECTED
        return (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 mb-4">
            <WifiOff size={14} />
            <span>Offline Mode</span>
          </div>
        );
    }
  };

  return (
    <>
      {/* BACKDROP OVERLAY - High Z-Index */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity duration-300 print:hidden
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* SIDEBAR DRAWER - Highest Z-Index */}
      <div className={`
        fixed top-0 left-0 z-[70] h-full w-[280px] bg-slate-900 text-white flex flex-col
        transition-transform duration-300 ease-in-out shadow-2xl print:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div onClick={() => handleNavigation('/dashboard')} className="cursor-pointer">
            <h1 className={getGradientText()}>
              {appConfig.appName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Team Performance System</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <nav>
            <div className={getThemeClass(location.pathname === '/dashboard')} onClick={() => handleNavigation('/dashboard')}>
              <LayoutDashboard size={20} className="mr-3" />
              <span>Dashboard</span>
            </div>

            {currentUser?.role === UserRole.ADMIN && (
              <div className={getThemeClass(location.pathname === '/admin/tasks')} onClick={() => handleNavigation('/admin/tasks')}>
                <ClipboardList size={20} className="mr-3" />
                <span>All Tasks</span>
              </div>
            )}

            {currentUser?.role === UserRole.SUPERVISOR && (
              <div className={getThemeClass(location.pathname === '/my-tasks')} onClick={() => handleNavigation('/my-tasks')}>
                <CheckSquare size={20} className="mr-3" />
                <span>My Tasks</span>
              </div>
            )}

            <div className={getThemeClass(location.pathname === '/evaluation')} onClick={() => handleNavigation('/evaluation')}>
              <FileText size={20} className="mr-3" />
              <span>Evaluation Input</span>
            </div>

            {currentUser?.role === 'ADMIN' && (
              <>
                <div className="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Data Management
                </div>

                <div className={getThemeClass(location.pathname === '/admin/sales')} onClick={() => handleNavigation('/admin/sales')}>
                  <Briefcase size={20} className="mr-3" />
                  <span>Sales Team</span>
                </div>

                <div className={getThemeClass(location.pathname === '/admin/users')} onClick={() => handleNavigation('/admin/users')}>
                  <Users size={20} className="mr-3" />
                  <span>User</span>
                </div>

                <div className={getThemeClass(location.pathname === '/admin/supervisors')} onClick={() => handleNavigation('/admin/supervisors')}>
                  <UserCog size={20} className="mr-3" />
                  <span>Supervisor</span>
                </div>

                <div className={getThemeClass(location.pathname === '/admin/principles')} onClick={() => handleNavigation('/admin/principles')}>
                  <Layers size={20} className="mr-3" />
                  <span>Principle</span>
                </div>

                <div className="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  App Management
                </div>

                <div className={getThemeClass(location.pathname === '/admin/export')} onClick={() => handleNavigation('/admin/export')}>
                  <DatabaseBackup size={20} className="mr-3" />
                  <span>Export Data</span>
                </div>

                <div className={getThemeClass(location.pathname === '/admin/settings')} onClick={() => handleNavigation('/admin/settings')}>
                  <Settings size={20} className="mr-3" />
                  <span>Settings</span>
                </div>
              </>
            )}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          {getConnectionBadge()}

          <div
            className="flex items-center mb-4 cursor-pointer hover:bg-slate-900 p-2 rounded transition-colors"
            onClick={() => setIsProfileOpen(true)}
          >
            <Avatar src={currentUser?.avatar} name={currentUser?.fullName || 'U'} className="w-10 h-10" />
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate max-w-[140px]">{currentUser?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.role}</p>
            </div>
          </div>
          <button
            onClick={() => refreshData()}
            disabled={isLoading}
            className={`w-full flex items-center justify-center p-2 mb-2 text-sm text-blue-400 hover:bg-blue-900/20 rounded transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' : 'Refresh Data'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 text-sm text-red-400 hover:bg-red-900/20 rounded transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Profile Modal Popup */}
      {isProfileOpen && currentUser && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-in">
            <div className={`h-32 bg-gradient-to-r ${appConfig.themeColor === 'emerald' ? 'from-emerald-600 to-green-500' : appConfig.themeColor === 'red' ? 'from-red-600 to-orange-500' : 'from-blue-600 to-cyan-500'}`}></div>

            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/20 rounded-full p-1"
            >
              <X size={20} />
            </button>

            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-6 flex justify-center">
                <Avatar src={currentUser.avatar} name={currentUser.fullName} className="w-32 h-32 border-4 border-white shadow-lg bg-white" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">{currentUser.fullName}</h2>
                <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">
                  {currentUser.role}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500 mr-4">
                    <Layers size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Principle</p>
                    <p className="font-medium text-slate-700">{currentUser.principle}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500 mr-4">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">User ID</p>
                    <p className="font-medium text-slate-700 font-mono text-sm">{currentUser.id}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
