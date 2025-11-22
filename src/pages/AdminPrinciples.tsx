import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Search, Briefcase, Tag } from 'lucide-react';

export const AdminPrinciples: React.FC = () => {
    const { principles, addPrinciple, deletePrinciple } = useApp();
    const [newPrinciple, setNewPrinciple] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPrinciples = principles.filter(p =>
        p.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPrinciple.trim()) {
            addPrinciple(newPrinciple.trim().toUpperCase());
            setNewPrinciple('');
        }
    };

    const handleDelete = (name: string) => {
        if (window.confirm(`Are you sure you want to delete principle "${name}"?`)) {
            deletePrinciple(name);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Principle Management</h2>
                    <p className="text-slate-500">Manage business principles and categories</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Add New Principle Card */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 sticky top-24">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="text-blue-600" size={20} /> Add Principle
                        </h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Principle Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold text-slate-700 placeholder:font-normal"
                                    value={newPrinciple}
                                    onChange={e => setNewPrinciple(e.target.value)}
                                    placeholder="e.g. NESTLE"
                                />
                                <p className="text-xs text-slate-400 mt-2">
                                    Principle names are unique identifiers used across the system.
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg flex justify-center items-center gap-2"
                            >
                                <Plus size={18} /> Add Principle
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Principles */}
                <div className="md:col-span-2 space-y-4">
                    {/* Search */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                        <Search className="text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search principles..."
                            className="flex-1 outline-none text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <span className="font-bold text-slate-700 text-sm uppercase">All Principles ({filteredPrinciples.length})</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {filteredPrinciples.length > 0 ? (
                                filteredPrinciples.map((principle, idx) => (
                                    <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Tag size={20} />
                                            </div>
                                            <span className="font-bold text-slate-800">{principle}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(principle)}
                                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Principle"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400">
                                    No principles found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
