import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { Plus, Edit2, Trash2, Search, User as UserIcon, Shield, Briefcase } from 'lucide-react';

export const AdminSupervisors: React.FC = () => {
    const { usersList, addUser, updateUser, deleteUser, principles } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<User>>({
        fullName: '',
        role: UserRole.SUPERVISOR,
        principle: 'ALL PRINCIPLE',
        joinDate: new Date().toISOString().split('T')[0]
    });

    // Filter only Supervisors
    const filteredUsers = usersList.filter(user =>
        user.role === UserRole.SUPERVISOR &&
        (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.principle.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData(user);
        } else {
            setEditingUser(null);
            setFormData({
                fullName: '',
                role: UserRole.SUPERVISOR,
                principle: 'ALL PRINCIPLE',
                joinDate: new Date().toISOString().split('T')[0]
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            updateUser({ ...editingUser, ...formData } as User);
        } else {
            addUser(formData as Omit<User, 'id'>);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this supervisor?')) {
            deleteUser(id);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Supervisor Management</h2>
                    <p className="text-slate-500">Manage supervisor accounts and assignments</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
                >
                    <Plus size={20} /> Add Supervisor
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search supervisors by name or principle..."
                    className="flex-1 outline-none text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-xs">
                            <tr>
                                <th className="p-4">Supervisor Info</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Principle</th>
                                <th className="p-4">Join Date</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {user.avatar ? <img src={user.avatar} alt={user.fullName} className="w-full h-full rounded-full object-cover" /> : <UserIcon size={20} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{user.fullName}</div>
                                                    <div className="text-xs text-slate-500">ID: {user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-slate-600">{user.principle}</td>
                                        <td className="p-4 text-slate-500 text-sm">{user.joinDate || '-'}</td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Supervisor"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Supervisor"
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
                                        No supervisors found matching your search.
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
                            <h3 className="font-bold text-lg text-slate-800">{editingUser ? 'Edit Supervisor' : 'Add New Supervisor'}</h3>
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
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 font-bold"
                                        value={UserRole.SUPERVISOR}
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
                                    {editingUser ? 'Save Changes' : 'Create Supervisor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
