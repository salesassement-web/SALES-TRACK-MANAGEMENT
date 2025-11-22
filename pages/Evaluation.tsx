import React, { useState, useEffect } from 'react';
import { useApp } from '../src/context/AppContext';
import { UserRole, ScoreData, SalesPerson } from '../types';
import { Save, Calendar, Filter, User, ChevronRight, ArrowLeft, Table as TableIcon, CheckCircle2 } from 'lucide-react';
import { Avatar } from '../components/Avatar';

type AssessmentType = 'SUPERVISOR' | 'KASIR' | 'HRD';

interface RangeInputProps {
  label: string;
  keyName: keyof ScoreData;
  weight: number;
  value: number;
  onChange: (val: number) => void;
}

const RangeInput: React.FC<RangeInputProps> = ({ label, keyName, weight, value, onChange }) => {
  return (
    <div className="mb-5 bg-slate-50 p-4 rounded-lg border border-slate-100 animate-fade-in">
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-bold text-slate-700">{label}</label>
        <div className="text-right">
           <span className="text-xs text-slate-400 mr-2">Bobot: {(weight * 100).toFixed(0)}%</span>
           <span className="text-sm font-bold text-blue-600">{value} / 100</span>
        </div>
      </div>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="mt-2 flex justify-between items-center text-xs">
         <span className="text-slate-400">Score Contribution:</span>
         <span className="font-mono font-medium text-slate-600 bg-white px-2 py-1 rounded border">
           {value} x {weight} = {(value * weight).toFixed(2)}
         </span>
      </div>
    </div>
  );
};

export const Evaluation: React.FC = () => {
  const { currentUser, salesList, usersList, principles, updateScore, getEvaluation, kpiConfig } = useApp();
  
  // Flow State
  const [activeTab, setActiveTab] = useState<AssessmentType>('SUPERVISOR');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterPrinciple, setFilterPrinciple] = useState<string>('');
  const [filterSupervisor, setFilterSupervisor] = useState<string>('');
  
  // Selection State
  const [selectedSales, setSelectedSales] = useState<SalesPerson | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Derived State
  const year = parseInt(selectedMonth.split('-')[0]);
  const month = parseInt(selectedMonth.split('-')[1]);
  const supervisors = usersList.filter(u => u.role === UserRole.SUPERVISOR);

  // Initialize View based on Role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === UserRole.SUPERVISOR) setActiveTab('SUPERVISOR');
      else if (currentUser.role === UserRole.KASIR) setActiveTab('KASIR');
      else if (currentUser.role === UserRole.HRD) setActiveTab('HRD');
      // Admin stays default or can switch
    }
  }, [currentUser]);

  // Filter Sales List
  const filteredSales = salesList.filter(s => {
    if (currentUser?.role === UserRole.SUPERVISOR && s.supervisorName !== currentUser.fullName) return false;
    if (filterPrinciple && s.principle !== filterPrinciple) return false;
    if (filterSupervisor && s.supervisorName !== filterSupervisor) return false;
    return true;
  });

  const handleSelectSales = (sales: SalesPerson) => {
    setSelectedSales(sales);
    const existingEval = getEvaluation(sales.id, month, year);
    setFormData(existingEval?.scores || {});
  };

  const handleInputChange = (key: string, value: number) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!selectedSales) return;
    updateScore(selectedSales.id, month, year, formData);
    alert("Data Penilaian berhasil disimpan!");
    setSelectedSales(null);
  };

  // --- Dynamic Calculation Helper ---
  const calculateBreakdown = (scores: ScoreData | undefined) => {
    if (!scores) return { spv: 0, kasir: 0, hrd: 0, total: 0 };

    const calcSection = (sectionKey: 'supervisor' | 'kasir' | 'hrd') => {
        const config = kpiConfig[sectionKey];
        let raw = 0;
        config.criteria.forEach(c => {
            raw += (scores[c.key] || 0) * c.weight;
        });
        return raw * config.totalWeight;
    };

    const spv = parseFloat(calcSection('supervisor').toFixed(2));
    const kasir = parseFloat(calcSection('kasir').toFixed(2));
    const hrd = parseFloat(calcSection('hrd').toFixed(2));
    
    return { spv, kasir, hrd, total: parseFloat((spv + kasir + hrd).toFixed(2)) };
  };

  const renderRoleSelector = () => {
    if (currentUser?.role !== UserRole.ADMIN) return null;
    return (
      <div className="grid grid-cols-3 gap-4 mb-8">
        {['SUPERVISOR', 'KASIR', 'HRD'].map((role) => (
            <button 
                key={role}
                onClick={() => setActiveTab(role as AssessmentType)}
                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold shadow-md
                ${activeTab === role ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400 hover:border-blue-200 hover:shadow-lg'}`}
            >
                <span>{role === 'KASIR' ? 'KASIR' : role}</span>
            </button>
        ))}
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 mb-8 hover:shadow-2xl transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Pilih Bulan</label>
           <div className="relative">
             <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
             <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            />
           </div>
        </div>
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Pilih Principle</label>
           <div className="relative">
             <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
             <select 
              value={filterPrinciple}
              onChange={(e) => setFilterPrinciple(e.target.value)}
              className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 appearance-none"
             >
               <option value="">All Principles</option>
               {principles.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
           </div>
        </div>
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Pilih Supervisor</label>
           <div className="relative">
             <User className="absolute left-3 top-3 text-slate-400" size={18} />
             <select 
              value={filterSupervisor}
              onChange={(e) => setFilterSupervisor(e.target.value)}
              disabled={currentUser?.role === UserRole.SUPERVISOR}
              className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 appearance-none disabled:opacity-60"
             >
               <option value="">All Supervisors</option>
               {supervisors.map(s => <option key={s.id} value={s.fullName}>{s.fullName}</option>)}
             </select>
           </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    let colorClass = 'blue';
    let sectionTitle = 'Assessment';
    let criteria: any[] = [];

    // Determine active section based on tab
    if (activeTab === 'SUPERVISOR') {
        colorClass = 'blue';
        sectionTitle = kpiConfig.supervisor.label;
        criteria = kpiConfig.supervisor.criteria;
    } else if (activeTab === 'KASIR') {
        colorClass = 'emerald';
        sectionTitle = kpiConfig.kasir.label;
        criteria = kpiConfig.kasir.criteria;
    } else if (activeTab === 'HRD') {
        colorClass = 'orange';
        sectionTitle = kpiConfig.hrd.label;
        criteria = kpiConfig.hrd.criteria;
    }

    return (
        <div className="animate-scale-in">
            <button 
                onClick={() => setSelectedSales(null)}
                className="mb-4 flex items-center text-slate-500 hover:text-slate-800 font-medium"
            >
                <ArrowLeft size={18} className="mr-1" /> Kembali ke Daftar Sales
            </button>

            <div className={`bg-white rounded-xl shadow-xl border border-${colorClass}-100 overflow-hidden`}>
                <div className={`bg-${colorClass}-50 p-6 border-b border-${colorClass}-100 flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                        <Avatar src={selectedSales?.avatar} name={selectedSales?.fullName || 'S'} className="w-16 h-16 border-2 border-white shadow bg-white" />
                        <div>
                            <h2 className={`text-2xl font-bold text-${colorClass}-800`}>{selectedSales?.fullName}</h2>
                            <p className={`text-${colorClass}-600 font-medium`}>{selectedSales?.principle} | {selectedSales?.supervisorName}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">{sectionTitle}</p>
                        <p className="text-xs text-slate-400">Period: {selectedMonth}</p>
                    </div>
                </div>
                
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {criteria.map((crit) => (
                            <RangeInput 
                                key={crit.key} 
                                label={crit.label} 
                                keyName={crit.key} 
                                weight={crit.weight} 
                                value={formData[crit.key] || 0}
                                onChange={(val) => handleInputChange(crit.key, val)}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className={`bg-${colorClass}-600 hover:bg-${colorClass}-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-transform transform hover:-translate-y-1`}
                    >
                        <Save size={20} /> SIMPAN PENILAIAN
                    </button>
                </div>
            </div>
        </div>
    );
  };

  if (!currentUser) return <div>Access Denied</div>;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
       <div className="mb-8">
         <h2 className="text-2xl font-bold text-slate-800">Evaluation Input</h2>
         <p className="text-slate-500">Lakukan penilaian sales team berdasarkan KPI</p>
       </div>

       {!selectedSales ? (
         <>
            {renderRoleSelector()}
            {renderFilters()}
            
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden mb-8 hover:shadow-2xl transition-shadow">
               <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">Daftar Sales Team ({filteredSales.length})</h3>
               </div>
               {filteredSales.length === 0 ? (
                 <div className="p-12 text-center text-slate-400">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} />
                    </div>
                    <p>Tidak ada sales team yang sesuai filter.</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-100">
                    {filteredSales.map(sales => {
                        const ev = getEvaluation(sales.id, month, year);
                        let isDone = false;
                        if (activeTab === 'SUPERVISOR') isDone = !!ev?.supervisorRated;
                        if (activeTab === 'KASIR') isDone = !!ev?.kasirRated;
                        if (activeTab === 'HRD') isDone = !!ev?.hrdRated;

                        return (
                            <div key={sales.id} onClick={() => handleSelectSales(sales)} className="p-4 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors group">
                                <div className="flex items-center gap-4">
                                    <Avatar src={sales.avatar} name={sales.fullName} className="w-12 h-12" />
                                    <div>
                                        <p className="font-bold text-slate-800 group-hover:text-blue-700">{sales.fullName}</p>
                                        <p className="text-xs text-slate-500">{sales.principle} • {sales.supervisorName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isDone ? (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                                            <CheckCircle2 size={12} /> Dinilai
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
                                            Belum Dinilai
                                        </span>
                                    )}
                                    <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500" />
                                </div>
                            </div>
                        );
                    })}
                 </div>
               )}
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-shadow">
               <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <TableIcon size={18} className="text-slate-500"/>
                  <h3 className="font-bold text-slate-700">Hasil Penilaian {selectedMonth}</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                     <tr>
                       <th className="p-4">Sales Name</th>
                       <th className="p-4">Principle</th>
                       <th className="p-4 text-center bg-blue-50 text-blue-700">SPV</th>
                       <th className="p-4 text-center bg-emerald-50 text-emerald-700">Kasir</th>
                       <th className="p-4 text-center bg-orange-50 text-orange-700">HRD</th>
                       <th className="p-4 text-center">Total</th>
                       <th className="p-4 text-center">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredSales.map(sales => {
                        const ev = getEvaluation(sales.id, month, year);
                        const breakdown = calculateBreakdown(ev?.scores);
                        const hasEval = !!ev;

                        return (
                          <tr key={sales.id} className="hover:bg-slate-50">
                            <td className="p-4 font-medium text-slate-800">{sales.fullName}</td>
                            <td className="p-4 text-slate-500 text-xs font-bold">{sales.principle}</td>
                            
                            <td className="p-4 text-center">
                              {ev?.supervisorRated ? (
                                <span className="font-bold text-blue-600">{breakdown.spv}</span>
                              ) : <span className="text-slate-300 text-xs italic">Pending</span>}
                            </td>

                            <td className="p-4 text-center">
                              {ev?.kasirRated ? (
                                <span className="font-bold text-emerald-600">{breakdown.kasir}</span>
                              ) : <span className="text-slate-300 text-xs italic">Pending</span>}
                            </td>

                            <td className="p-4 text-center">
                              {ev?.hrdRated ? (
                                <span className="font-bold text-orange-600">{breakdown.hrd}</span>
                              ) : <span className="text-slate-300 text-xs italic">Pending</span>}
                            </td>

                            <td className="p-4 text-center">
                              {hasEval && ev.finalScore > 0 ? (
                                <span className="font-bold text-lg text-slate-800">{ev.finalScore}</span>
                              ) : <span className="text-slate-300">-</span>}
                            </td>

                            <td className="p-4 text-center">
                                {ev?.status === 'STAY' ? (
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">STAY</span>
                                ) : ev?.status === 'LEAVE' ? (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">LEAVE</span>
                                ) : (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-400 rounded-full text-xs font-bold">PROCESS</span>
                                )}
                            </td>
                          </tr>
                        );
                      })}
                   </tbody>
                 </table>
               </div>
            </div>
         </>
       ) : (
         renderForm()
       )}
    </div>
  );
};
