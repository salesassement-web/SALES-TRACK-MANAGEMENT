import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Evaluation as EvaluationType, ScoreData, UserRole } from '../types';
import { Save, Search, User, Calendar, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

export const Evaluation: React.FC = () => {
    const { salesList, getEvaluation, updateScore, kpiConfig, currentUser, principles } = useApp();

    // Selection State
    const [selectedSalesId, setSelectedSalesId] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [searchTerm, setSearchTerm] = useState('');

    // Filtered Sales List based on Role and Search
    const filteredSales = salesList.filter(sales => {
        const matchesSearch = sales.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sales.principle.toLowerCase().includes(searchTerm.toLowerCase());

        if (currentUser?.role === UserRole.ADMIN) return matchesSearch;
        if (currentUser?.role === UserRole.SUPERVISOR) return matchesSearch && sales.principle === currentUser.principle;
        // Other roles might see all or filtered, assuming ADMIN/SUPERVISOR for now
        return matchesSearch;
    });

    // Current Evaluation Data
    const currentEvaluation = getEvaluation(selectedSalesId, selectedMonth, selectedYear);

    // Local Score State (for inputs)
    const [localScores, setLocalScores] = useState<Partial<ScoreData>>({});

    useEffect(() => {
        if (currentEvaluation) {
            setLocalScores(currentEvaluation.scores);
        } else {
            setLocalScores({});
        }
    }, [currentEvaluation, selectedSalesId, selectedMonth, selectedYear]);

    const handleScoreChange = (key: keyof ScoreData, value: string) => {
        const numValue = parseFloat(value);
        setLocalScores(prev => ({
            ...prev,
            [key]: isNaN(numValue) ? undefined : numValue
        }));
    };

    const handleSave = () => {
        if (!selectedSalesId) return;
        updateScore(selectedSalesId, selectedMonth, selectedYear, localScores);
        alert('Evaluation Saved Successfully!');
    };

    const getSectionStatus = (section: 'supervisor' | 'kasir' | 'hrd') => {
        if (!currentEvaluation) return 'PENDING';
        if (section === 'supervisor' && currentEvaluation.supervisorRated) return 'COMPLETED';
        if (section === 'kasir' && currentEvaluation.kasirRated) return 'COMPLETED';
        if (section === 'hrd' && currentEvaluation.hrdRated) return 'COMPLETED';
        return 'PENDING';
    };

    const renderKPISection = (sectionKey: 'supervisor' | 'kasir' | 'hrd') => {
        const config = kpiConfig[sectionKey];
        const status = getSectionStatus(sectionKey);
        const isAllowed = currentUser?.role === UserRole.ADMIN || currentUser?.role === config.role;

        return (
            <div className={`bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden mb-6 ${!isAllowed ? 'opacity-70 pointer-events-none grayscale' : ''}`}>
                <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${sectionKey === 'supervisor' ? 'bg-blue-50 text-blue-800' :
                        sectionKey === 'kasir' ? 'bg-emerald-50 text-emerald-800' :
                            'bg-orange-50 text-orange-800'
                    }`}>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{config.label}</h3>
                        <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full font-bold border border-white/20">
                            {(config.totalWeight * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {status === 'COMPLETED' ? (
                            <span className="flex items-center gap-1 text-xs font-bold bg-white/80 px-2 py-1 rounded text-emerald-600">
                                <CheckCircle2 size={14} /> DONE
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs font-bold bg-white/80 px-2 py-1 rounded text-slate-500">
                                <AlertCircle size={14} /> PENDING
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {config.criteria.map((crit, idx) => (
                        <div key={crit.key as string} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">{crit.label}</label>
                                <span className="text-xs text-slate-400 font-mono">{(crit.weight * 100).toFixed(0)}%</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    disabled={!isAllowed}
                                    value={localScores[crit.key] ?? ''}
                                    onChange={(e) => handleScoreChange(crit.key, e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-800 disabled:bg-slate-50"
                                    placeholder="0.00"
                                />
                                <div className="absolute right-3 top-3 text-xs text-slate-400 font-bold">PTS</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Performance Evaluation</h2>
                    <p className="text-slate-500">Assess and review sales team performance</p>
                </div>
                {selectedSalesId && (
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all font-bold"
                    >
                        <Save size={20} /> Save Evaluation
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT SIDEBAR: SELECT SALES */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <User size={18} /> Select Sales Person
                        </h3>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search name..."
                                className="w-full pl-9 p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* List */}
                        <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {filteredSales.map(sales => (
                                <div
                                    key={sales.id}
                                    onClick={() => setSelectedSalesId(sales.id)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedSalesId === sales.id
                                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                                            : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${selectedSalesId === sales.id ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {sales.avatar ? <img src={sales.avatar} className="w-full h-full rounded-full object-cover" /> : sales.fullName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className={`font-bold text-sm ${selectedSalesId === sales.id ? 'text-blue-800' : 'text-slate-700'}`}>{sales.fullName}</div>
                                            <div className="text-xs text-slate-400">{sales.principle}</div>
                                        </div>
                                        {selectedSalesId === sales.id && <ChevronRight size={16} className="ml-auto text-blue-500" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT: FORM */}
                <div className="lg:col-span-8 space-y-6">
                    {selectedSalesId ? (
                        <>
                            {/* Period Selector */}
                            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2 text-slate-700 font-bold">
                                    <Calendar size={20} className="text-slate-400" />
                                    Evaluation Period:
                                </div>
                                <div className="flex gap-4">
                                    <select
                                        value={selectedMonth}
                                        onChange={e => setSelectedMonth(parseInt(e.target.value))}
                                        className="p-2 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:border-blue-500"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedYear}
                                        onChange={e => setSelectedYear(parseInt(e.target.value))}
                                        className="p-2 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:border-blue-500"
                                    >
                                        {[2023, 2024, 2025, 2026].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Score Summary */}
                                {currentEvaluation && (
                                    <div className="ml-auto flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400 font-bold uppercase">Final Score</div>
                                            <div className={`text-2xl font-black ${currentEvaluation.finalScore >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {currentEvaluation.finalScore.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-lg font-bold text-sm ${currentEvaluation.status === 'STAY' ? 'bg-emerald-100 text-emerald-700' :
                                                currentEvaluation.status === 'LEAVE' ? 'bg-red-100 text-red-700' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {currentEvaluation.status}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* KPI Sections */}
                            {renderKPISection('supervisor')}
                            {renderKPISection('kasir')}
                            {renderKPISection('hrd')}

                        </>
                    ) : (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-slate-400 h-[400px]">
                            <User size={48} className="mb-4 opacity-50" />
                            <h3 className="font-bold text-lg text-slate-500">No Sales Person Selected</h3>
                            <p className="text-sm">Please select a sales person from the list to start evaluation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
