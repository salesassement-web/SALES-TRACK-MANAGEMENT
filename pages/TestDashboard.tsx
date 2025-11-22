import React from 'react';
import { useApp } from '../src/context/AppContext';

export const TestDashboard: React.FC = () => {
    const { currentUser, salesList, usersList, evaluations } = useApp();

    return (
        <div className="p-8 space-y-6">
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                <h1 className="text-3xl font-bold text-green-700 mb-2">✅ Dashboard Loaded Successfully!</h1>
                <p className="text-green-600">If you see this, the routing and basic rendering works!</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4">User Info</h2>
                <div className="space-y-2">
                    <p><span className="font-bold">Name:</span> {currentUser?.fullName}</p>
                    <p><span className="font-bold">Role:</span> {currentUser?.role}</p>
                    <p><span className="font-bold">Principle:</span> {currentUser?.principle}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-sm font-bold text-blue-600 uppercase mb-2">Total Sales</h3>
                    <p className="text-4xl font-bold text-blue-700">{salesList.length}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                    <h3 className="text-sm font-bold text-emerald-600 uppercase mb-2">Total Users</h3>
                    <p className="text-4xl font-bold text-emerald-700">{usersList.length}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-sm font-bold text-orange-600 uppercase mb-2">Evaluations</h3>
                    <p className="text-4xl font-bold text-orange-700">{evaluations.length}</p>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                    <span className="font-bold">Note:</span> This is a simplified test dashboard.
                    If this loads correctly, the issue is in the main Dashboard component (likely with Recharts or complex rendering).
                </p>
            </div>
        </div>
    );
};
