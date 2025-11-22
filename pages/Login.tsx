import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, usersList, refreshData, currentUser } = useApp();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole | ''>('');
  const [principle, setPrinciple] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const roles = Object.values(UserRole);

  // Extract unique principles and supervisors dynamically from user list
  // This allows the login to reflect any new principles added by Admin
  const principles = Array.from(new Set(usersList.map(u => u.principle))).filter(Boolean);
  const supervisors = usersList.filter(u => u.role === UserRole.SUPERVISOR);

  // Navigate to dashboard after currentUser is set
  useEffect(() => {
    if (isLoggingIn && currentUser) {
      console.log("[Login] User state updated, navigating to dashboard...");
      navigate('/dashboard');
      setIsLoggingIn(false);
      // Fetch data in background after navigation
      setTimeout(() => {
        refreshData().catch(err => console.error("[Login] Error fetching data:", err));
      }, 100);
    }
  }, [currentUser, isLoggingIn, navigate, refreshData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role) {
      console.log("[Login] Initiating login...");
      setIsLoggingIn(true);
      login(role, principle, supervisorName);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500">Select your access level to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role Access</label>
            <select
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as UserRole);
                setPrinciple('');
                setSupervisorName('');
              }}
              required
            >
              <option value="">Select Role</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {role && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-slate-700 mb-2">Principle / Division</label>
              <select
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={principle}
                onChange={(e) => setPrinciple(e.target.value)}
                required
              >
                <option value="">Select Principle</option>
                {principles.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}

          {role === UserRole.SUPERVISOR && principle && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-slate-700 mb-2">Supervisor Name</label>
              <select
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                required
              >
                <option value="">Select Your Name</option>
                {supervisors
                  .filter(s => s.principle === principle) // Filter supervisors by principle
                  .map(s => <option key={s.id} value={s.fullName}>{s.fullName}</option>)}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={!role}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Access Dashboard
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">Don't have an account?</p>
          <button
            onClick={() => navigate('/register')}
            className="mt-2 text-blue-600 font-semibold hover:text-blue-800 text-sm flex items-center justify-center w-full"
          >
            <UserPlus size={16} className="mr-2" />
            Register New Account
          </button>
        </div>
      </div>
    </div>
  );
};