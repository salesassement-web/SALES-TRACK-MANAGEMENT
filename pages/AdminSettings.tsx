import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeColor, KPICriteria } from '../types';
import { Save, Layout, Sliders, RefreshCw, Info, Plus, Trash2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { appConfig, updateAppConfig, kpiConfig, updateKPIConfig } = useApp();
  
  // Local state for editing to prevent constant re-renders on global context
  const [localAppName, setLocalAppName] = useState(appConfig.appName);
  const [localKpiConfig, setLocalKpiConfig] = useState(kpiConfig);

  const colors: { id: ThemeColor; bg: string; ring: string }[] = [
      { id: 'blue', bg: 'bg-blue-600', ring: 'ring-blue-500' },
      { id: 'emerald', bg: 'bg-emerald-600', ring: 'ring-emerald-500' },
      { id: 'red', bg: 'bg-red-600', ring: 'ring-red-500' },
      { id: 'indigo', bg: 'bg-indigo-600', ring: 'ring-indigo-500' },
      { id: 'violet', bg: 'bg-violet-600', ring: 'ring-violet-500' },
      { id: 'orange', bg: 'bg-orange-600', ring: 'ring-orange-500' },
      { id: 'cyan', bg: 'bg-cyan-600', ring: 'ring-cyan-500' },
  ];

  const handleSaveGeneral = () => {
    updateAppConfig({ appName: localAppName });
    alert('App General Settings Saved!');
  };

  const handleKPIChange = (section: 'supervisor' | 'kasir' | 'hrd', index: number, field: 'label' | 'weight', value: any) => {
    const newConfig = { ...localKpiConfig };
    if (field === 'weight') {
        newConfig[section].criteria[index].weight = parseFloat(value);
    } else {
        newConfig[section].criteria[index].label = value;
    }
    setLocalKpiConfig(newConfig);
  };

  // Feature: Add New Criteria
  const handleAddCriterion = (sectionKey: 'supervisor' | 'kasir' | 'hrd') => {
    const newConfig = { ...localKpiConfig };
    // Use current timestamp to generate a pseudo-unique key for new fields
    const newKey = `custom_${Date.now()}`; 
    
    newConfig[sectionKey].criteria.push({
        key: newKey as any, 
        label: 'New Criteria',
        weight: 0
    });
    setLocalKpiConfig(newConfig);
  };

  // Feature: Delete Criteria
  const handleDeleteCriterion = (sectionKey: 'supervisor' | 'kasir' | 'hrd', index: number) => {
    if (window.confirm("Are you sure? This will remove this criteria from calculations.")) {
        const newConfig = { ...localKpiConfig };
        newConfig[sectionKey].criteria.splice(index, 1);
        setLocalKpiConfig(newConfig);
    }
  };

  const handleTotalWeightChange = (section: 'supervisor' | 'kasir' | 'hrd', value: number) => {
    const newConfig = { ...localKpiConfig };
    newConfig[section].totalWeight = value;
    setLocalKpiConfig(newConfig);
  };

  const handleSaveKPI = () => {
      updateKPIConfig(localKpiConfig);
      alert('KPI Configurations Saved!');
  };

  const getSum = (criteria: KPICriteria[]) => criteria.reduce((sum, item) => sum + item.weight, 0);

  const KPICard = ({ sectionKey, title, color }: { sectionKey: 'supervisor' | 'kasir' | 'hrd', title: string, color: string }) => {
      const section = localKpiConfig[sectionKey];
      const sum = getSum(section.criteria);
      const isValid = Math.abs(sum - 1.0) < 0.02; // Allow small float error margin

      return (
        <div className={`bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden mb-6 hover:shadow-2xl transition-shadow`}>
            <div className={`p-4 bg-${color}-50 border-b border-${color}-100 flex justify-between items-center`}>
                <h3 className={`font-bold text-${color}-800 text-sm md:text-base`}>{title}</h3>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500 hidden md:inline">Total Weight:</label>
                    <input 
                        type="number" 
                        step="0.01"
                        value={section.totalWeight}
                        onChange={(e) => handleTotalWeightChange(sectionKey, parseFloat(e.target.value))}
                        className={`w-16 p-1 text-center border rounded font-bold text-${color}-700 text-sm`}
                    />
                </div>
            </div>
            <div className="p-4 md:p-6">
                <div className="grid grid-cols-12 gap-4 mb-2 text-xs font-bold text-slate-400 uppercase">
                    <div className="col-span-7">Criterion Name</div>
                    <div className="col-span-4 text-right">Weight (0-1)</div>
                    <div className="col-span-1 text-center">Act</div>
                </div>
                {section.criteria.map((crit, idx) => (
                    <div key={crit.key as string || idx} className="grid grid-cols-12 gap-4 mb-3 items-center animate-fade-in">
                        <div className="col-span-7">
                            <input 
                                type="text"
                                value={crit.label}
                                onChange={(e) => handleKPIChange(sectionKey, idx, 'label', e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="col-span-4">
                            <input 
                                type="number"
                                step="0.01"
                                value={crit.weight}
                                onChange={(e) => handleKPIChange(sectionKey, idx, 'weight', e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded text-sm font-mono text-right focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="col-span-1 flex justify-center">
                            <button 
                                onClick={() => handleDeleteCriterion(sectionKey, idx)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Delete Criterion"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* ADD BUTTON */}
                <button
                    onClick={() => handleAddCriterion(sectionKey)}
                    className={`w-full py-3 mt-2 border-2 border-dashed border-${color}-200 rounded-lg text-${color}-600/70 font-bold text-xs hover:bg-${color}-50 hover:text-${color}-700 hover:border-${color}-300 transition-all flex justify-center items-center gap-2`}
                >
                    <Plus size={14} /> ADD CRITERIA
                </button>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-xs text-slate-500 hidden md:block">
                        <Info size={14} className="inline mr-1"/>
                        Weights must sum to ~1.0
                    </div>
                    <div className={`font-bold text-sm ${isValid ? 'text-emerald-600' : 'text-red-500'}`}>
                        Sum: {sum.toFixed(2)} / 1.00
                    </div>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10 w-full">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">App Settings</h2>
            <p className="text-slate-500">Customize application appearance and KPI metrics</p>
        </div>
      </div>

      {/* 1. General Settings */}
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-6 hover:shadow-2xl transition-shadow">
        <div className="flex items-center gap-2 mb-6">
            <Layout className="text-slate-400" size={20}/>
            <h3 className="text-lg font-bold text-slate-800">General Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Application Title</label>
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={localAppName}
                        onChange={(e) => setLocalAppName(e.target.value)}
                        className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                    <button 
                        onClick={handleSaveGeneral}
                        className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <Save size={18} />
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Theme Color</label>
                <div className="flex flex-wrap gap-3">
                    {colors.map(c => (
                        <button
                            key={c.id}
                            onClick={() => updateAppConfig({ themeColor: c.id })}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${c.bg} transition-all hover:scale-110 ${appConfig.themeColor === c.id ? `ring-4 ring-offset-2 ${c.ring}` : 'opacity-70 hover:opacity-100'}`}
                            title={c.id}
                        />
                    ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">Selected: <span className="font-bold uppercase">{appConfig.themeColor}</span></p>
            </div>
        </div>
      </div>

      {/* 2. KPI Settings */}
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
                <Sliders className="text-slate-400" size={20}/>
                <h3 className="text-lg font-bold text-slate-800">KPI Criteria & Weights</h3>
            </div>
            <button 
                onClick={handleSaveKPI}
                className="w-full md:w-auto bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg"
            >
                <Save size={18} /> Save All KPIs
            </button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <KPICard sectionKey="supervisor" title="Supervisor Weights" color="blue" />
             <KPICard sectionKey="kasir" title="Cashier Weights" color="emerald" />
             <KPICard sectionKey="hrd" title="HRD Weights" color="orange" />
             
             {/* Info Card */}
             <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-center items-center text-center shadow-md">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <RefreshCw size={32} className="text-slate-400"/>
                </div>
                <h4 className="font-bold text-slate-700">Dynamic Updates</h4>
                <p className="text-sm text-slate-500 mt-2 max-w-xs">
                   Added criteria will immediately appear in the Evaluation Form. Make sure to set appropriate weights.
                </p>
             </div>
         </div>
      </div>
    </div>
  );
};