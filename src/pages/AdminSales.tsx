import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SalesPerson } from '../types';
import { Plus, Edit2, Trash2, Search, User as UserIcon, Briefcase, UserCheck } from 'lucide-react';

export const AdminSales: React.FC = () => {
    const { salesList, addSalesPerson, updateSalesPerson, deleteSalesPerson, principles } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSales, setEditingSales] = useState<SalesPerson | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<SalesPerson>>({
        fullName: '',
        principle: 'ALL PRINCIPLE',
        supervisorName: '',
        joinDate: new Date().toISOString().split('T')[0]
    });

    const filteredSales = salesList.filter(sales =>
        sales.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sales.principle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sales.supervisorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (sales?: SalesPerson) => {
        if (sales) {
            setEditingSales(sales);
            setFormData(sales);
        } else {
            setEditingSales(null);
            setFormData({
                fullName: '',
                principle: 'ALL PRINCIPLE',
                supervisorName: '',
                joinDate: new Date().toISOString().split('T')[0]
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSales) {
            updateSalesPerson({ ...editingSales, ...formData } as SalesPerson);
        } else {
            addSalesPerson(formData as Omit<SalesPerson, 'id'>);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this sales person?')) {
            deleteSalesPerson(id);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Sales Team Management</h2>
                    <p className="text-slate-500">Manage sales personnel and assignments</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
                >
                    <Plus size={20} /> Add Sales Person
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, principle, or supervisor..."
                    className="flex-1 outline-none text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-xs">
                            <tr>
                                <th className="p-4">Sales Person</th>
                                <th className="p-4">Principle</th>
                                <th className="p-4">Supervisor</th>
                                <th className="p-4">Join Date</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSales.length > 0 ? (
                                filteredSales.map(sales => (
                                    <tr key={sales.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                                    {sales.avatar ? <img src={sales.avatar} alt={sales.fullName} className="w-full h-full rounded-full object-cover" /> : <UserIcon size={20} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{sales.fullName}</div>
                                                    <div className="text-xs text-slate-500">ID: {sales.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                {sales.principle}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-slate-600">{sales.supervisorName}</td>
                                        <td className="p-4 text-slate-500 text-sm">{sales.joinDate || '-'}</td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(sales)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Sales Person"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sales.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Sales Person"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        No sales persons found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">{editingSales ? 'Edit Sales Person' : 'Add New Sales Person'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Principle</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <select
                                        className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                                        value={formData.principle}
                                        onChange={e => setFormData({ ...formData, principle: e.target.value })}
                                    >
                                        {principles.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Supervisor Name</label>
                                <div className="relative">
                                    <UserCheck className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.supervisorName}
                                        onChange={e => setFormData({ ...formData, supervisorName: e.target.value })}
                                        placeholder="e.g. Supervisor Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Join Date</label>
                                <input
                                    type="date"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.joinDate}
                                    onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
                                >
                                    {editingSales ? 'Save Changes' : 'Add Sales Person'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
