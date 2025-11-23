import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Upload } from 'lucide-react';

export const Register: React.FC = () => {
  const { addUser, principles } = useApp();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.SUPERVISOR);
  const [principle, setPrinciple] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [avatar, setAvatar] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addUser({
      fullName,
      role,
      principle,
      joinDate,
      avatar: avatar || '' // No default URL
    });

    alert("Registration successful! Please login.");
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <button 
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-slate-600 mb-4 flex items-center text-sm"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Login
        </button>

        <div className="text-center mb-6">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
          <p className="text-slate-500">Join the SalesForce Team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           {/* Avatar Upload */}
           <div className="flex flex-col items-center mb-2">
                <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                  {avatar ? (
                    <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-slate-400" size={20} />
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
                <span className="text-xs text-slate-500 mt-1">Upload Photo (Optional)</span>
           </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
            >
              {Object.values(UserRole).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Principle / Division</label>
            <select
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={principle}
              onChange={e => setPrinciple(e.target.value)}
            >
              <option value="">Select Principle</option>
              {principles.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
            <input
              type="date"
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={joinDate}
              onChange={e => setJoinDate(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-lg transform transition hover:-translate-y-0.5 mt-4"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};
