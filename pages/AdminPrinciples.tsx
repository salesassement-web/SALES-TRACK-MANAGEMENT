import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Layers } from 'lucide-react';

export const AdminPrinciples: React.FC = () => {
  const { principles, addPrinciple, deletePrinciple } = useApp();
  const [newPrinciple, setNewPrinciple] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrinciple.trim()) {
      addPrinciple(newPrinciple.toUpperCase());
      setNewPrinciple('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Principle Database</h2>
            <p className="text-slate-500">Manage business units and principles</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleAdd} className="flex gap-4 mb-8">
          <div className="flex-1">
             <input 
                type="text"
                value={newPrinciple}
                onChange={(e) => setNewPrinciple(e.target.value)}
                placeholder="Enter new Principle name (e.g. MAYORA)"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
             />
          </div>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center"
          >
            <Plus size={20} className="mr-2" /> Add Principle
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {principles.map((principle) => (
            <div key={principle} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 group hover:border-blue-300 transition-all">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-md mr-3 shadow-sm">
                  <Layers size={18} className="text-blue-500" />
                </div>
                <span className="font-semibold text-slate-700">{principle}</span>
              </div>
              <button 
                onClick={() => deletePrinciple(principle)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                title="Delete Principle"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
