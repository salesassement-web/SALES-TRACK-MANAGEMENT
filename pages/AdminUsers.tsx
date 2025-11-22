import React, { useState } from 'react';
import { useApp } from '../src/context/AppContext';
import { UserRole, User } from '../types';
import { Trash2, Edit2, Plus, X, Save, Upload } from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const AdminUsers: React.FC = () => {
  const { usersList, deleteUser, addUser, updateUser, principles } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: '',
    role: UserRole.SUPERVISOR,
    principle: '',
    joinDate: new Date().toISOString().split('T')[0],
    avatar: ''
  });

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        role: UserRole.SUPERVISOR,
        principle: '',
        joinDate: new Date().toISOString().split('T')[0],
        avatar: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.principle) return;

    if (editingUser) {
      updateUser({ ...editingUser, ...formData } as User);
    } else {
      addUser({
        fullName: formData.fullName!,
        role: formData.role as UserRole,
        principle: formData.principle!,
        joinDate: formData.joinDate,
        avatar: formData.avatar || ''
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
            <p className="text-slate-500">Manage system access and roles</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="p-4">Full Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Principle</th>
                <th className="p-4">Join Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800 flex items-center gap-3">
                     <Avatar src={user.avatar} name={user.fullName} className="w-8 h-8" />
                     {user.fullName}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                        user.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-700' : 
                        user.role === 'HRD' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{user.principle}</td>
                  <td className="p-4 text-slate-500">{user.joinDate || '-'}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingUser ? 'Edit User' : 'New User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-slate-400" size={24} />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 mt-2">Click to upload photo</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Principle</label>
                <select 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.principle}
                  onChange={e => setFormData({...formData, principle: e.target.value})}
                >
                  <option value="">Select Principle</option>
                  {principles.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.joinDate}
                  onChange={e => setFormData({...formData, joinDate: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2">
                  <Save size={18} /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
