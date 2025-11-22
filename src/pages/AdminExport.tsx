import React from 'react';
import { useApp } from '../context/AppContext';
import { Download, FileText, Database } from 'lucide-react';

export const AdminExport: React.FC = () => {
    const { usersList, salesList, evaluations, tasks, principles } = useApp();

    const downloadJSON = (data: any, filename: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        // Get headers
        const headers = Object.keys(data[0]);

        // Convert to CSV
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => {
                const val = row[fieldName];
                return typeof val === 'object' ? JSON.stringify(val).replace(/,/g, ';') : val;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Data Export</h2>
                    <p className="text-slate-500">Download system data for backup or analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Users Export */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Users Data</h3>
                            <p className="text-xs text-slate-500">{usersList.length} Records</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => downloadJSON(usersList, 'users')}
                            className="flex-1 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                        >
                            <FileText size={16} /> JSON
                        </button>
                        <button
                            onClick={() => downloadCSV(usersList, 'users')}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                            <Download size={16} /> CSV
                        </button>
                    </div>
                </div>

                {/* Sales Export */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Sales Team Data</h3>
                            <p className="text-xs text-slate-500">{salesList.length} Records</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => downloadJSON(salesList, 'sales_team')}
                            className="flex-1 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                        >
                            <FileText size={16} /> JSON
                        </button>
                        <button
                            onClick={() => downloadCSV(salesList, 'sales_team')}
                            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center justify-center gap-2"
                        >
                            <Download size={16} /> CSV
                        </button>
                    </div>
                </div>

                {/* Evaluations Export */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Evaluations Data</h3>
                            <p className="text-xs text-slate-500">{evaluations.length} Records</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => downloadJSON(evaluations, 'evaluations')}
                            className="flex-1 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                        >
                            <FileText size={16} /> JSON
                        </button>
                        <button
                            onClick={() => downloadCSV(evaluations.map(e => ({
                                ...e,
                                scores: JSON.stringify(e.scores) // Flatten for CSV
                            })), 'evaluations')}
                            className="flex-1 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 flex items-center justify-center gap-2"
                        >
                            <Download size={16} /> CSV
                        </button>
                    </div>
                </div>

                {/* Tasks Export */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Tasks Data</h3>
                            <p className="text-xs text-slate-500">{tasks.length} Records</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => downloadJSON(tasks, 'tasks')}
                            className="flex-1 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                        >
                            <FileText size={16} /> JSON
                        </button>
                        <button
                            onClick={() => downloadCSV(tasks, 'tasks')}
                            className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2"
                        >
                            <Download size={16} /> CSV
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
