import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { UserPlus, Shield, Briefcase, User, Lock, ArrowLeft } from 'lucide-react';

export const Register: React.FC = () => {
    const { login, appConfig, principles } = useApp();
    const navigate = useNavigate();

    const [role, setRole] = useState<UserRole>(UserRole.SUPERVISOR);
    const [principle, setPrinciple] = useState<string>('KALBE');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network delay
        setTimeout(() => {
            // In this app, registration is same as login for now (auto-create)
            login(role, principle, username);
            setIsLoading(false);
            navigate('/dashboard');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className={`absolute bottom-[20%] left-[10%] w-[60%] h-[60%] rounded-full bg-${appConfig.themeColor}-400/20 blur-3xl`}></div>
                <div className={`absolute top-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-3xl`}></div>
            </div>

            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 animate-scale-in border border-slate-100">
                {/* Header */}
                <div className={`bg-slate-900 p-8 text-center relative overflow-hidden`}>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                            <UserPlus className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
                        <p className="text-slate-400 text-sm mt-1">Join {appConfig.appName}</p>
                    </div>

                    {/* Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="p-8 space-y-5">

                    {/* Role Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Select Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                            >
                                {Object.values(UserRole).map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Principle Selection */}
                    {(role === UserRole.SUPERVISOR || role === UserRole.MANAGER) && (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Select Principle</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <select
                                    value={principle}
                                    onChange={(e) => setPrinciple(e.target.value)}
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                >
                                    {principles.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Username */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Create a password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl hover:bg-blue-700 hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Creating Account...</span>
                        ) : (
                            <>
                                <UserPlus size={20} /> Register
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <Link to="/" className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center justify-center gap-1">
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
};
