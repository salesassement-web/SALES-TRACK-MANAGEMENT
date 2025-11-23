import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus, TaskPriority } from '../types';
import { CheckSquare, Clock, AlertTriangle, CheckCircle2, BarChart2, Filter, Calendar, X, Check, Eye, Printer, UserCog } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { DonutChart } from '../components/DonutChart';

export const AdminTasks: React.FC = () => {
    const { tasks, usersList, principles, updateTask, appConfig, currentUser } = useApp();

    // Filter States
    const [timeFilter, setTimeFilter] = useState<'WEEK' | 'MONTH' | 'YEAR'>('WEEK');
    const [groupFilter, setGroupFilter] = useState<'SUPERVISOR' | 'PRINCIPLE'>('PRINCIPLE');

    // Enriched Data
    const enrichedTasks = useMemo(() => {
        return tasks.map(task => {
            const supervisor = usersList.find(u => u.id === task.supervisorId);
            return {
                ...task,
                supervisorName: supervisor?.fullName || 'Unknown',
                principle: supervisor?.principle || 'Unknown'
            };
        });
    }, [tasks, usersList]);

    const totalTasks = enrichedTasks.length;
    const openTasks = enrichedTasks.filter(t => t.status === TaskStatus.OPEN).length;
    const pendingTasks = enrichedTasks.filter(t => t.status === TaskStatus.PENDING).length;
    const ongoingTasks = enrichedTasks.filter(t => t.status === TaskStatus.ONGOING).length;
    const completedTasks = enrichedTasks.filter(t => t.status === TaskStatus.COMPLETED).length;

    const progressByPrinciple = useMemo(() => {
        return principles
            .filter(p => p !== 'ALL PRINCIPLE' && p !== 'ALL SANCHO')
            .map(p => {
                const pTasks = enrichedTasks.filter(t => t.principle === p);
                const total = pTasks.length;
                if (total === 0) return null;
                const done = pTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
                const pct = Math.round((done / total) * 100);
                return { name: p, total, done, pct };
            })
            .filter(Boolean);
    }, [enrichedTasks, principles]);

    const chartData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        if (timeFilter === 'WEEK') startDate.setDate(now.getDate() - 7);
        else if (timeFilter === 'MONTH') startDate.setMonth(now.getMonth() - 1);
        else startDate.setFullYear(now.getFullYear() - 1);

        const filteredByTime = enrichedTasks.filter(t => new Date(t.taskDate) >= startDate);
        const grouped: Record<string, any> = {};

        filteredByTime.forEach(t => {
            const key = groupFilter === 'SUPERVISOR' ? t.supervisorName : t.principle;
            if (!grouped[key]) grouped[key] = { name: key, open: 0, pending: 0, ongoing: 0, completed: 0 };
            if (t.status === TaskStatus.OPEN) grouped[key].open++;
            else if (t.status === TaskStatus.PENDING) grouped[key].pending++;
            else if (t.status === TaskStatus.ONGOING) grouped[key].ongoing++;
            else if (t.status === TaskStatus.COMPLETED) grouped[key].completed++;
        });
        return Object.values(grouped);
    }, [enrichedTasks, timeFilter, groupFilter]);

    // Donut Chart Data 1: Tasks by Principle
    const tasksByPrinciple = useMemo(() => {
        const distribution: Record<string, number> = {};

        // Initialize with 0 for all principles
        principles.forEach(p => {
            if (p !== 'ALL PRINCIPLE' && p !== 'ALL SANCHO') {
                distribution[p] = 0;
            }
        });

        enrichedTasks.forEach(task => {
            const p = task.principle;
            if (p && p !== 'Unknown') {
                if (distribution[p] !== undefined) {
                    distribution[p]++;
                } else {
                    distribution[p] = (distribution[p] || 0) + 1;
                }
            }
        });

        return Object.entries(distribution)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0);
    }, [enrichedTasks, principles]);

    // Donut Chart Data 2: Tasks by Supervisor
    const tasksBySupervisor = useMemo(() => {
        const distribution: Record<string, number> = {};

        enrichedTasks.forEach(task => {
            const name = task.supervisorName;
            distribution[name] = (distribution[name] || 0) + 1;
        });

        return Object.entries(distribution)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [enrichedTasks]);

    return (
        <div className="w-full print-content">
            {/* Controls - No Print */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Task Monitoring</h2>
                    <p className="text-slate-500 text-sm">Global view of all Supervisor tasks</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                    <Printer size={18} /> Save PDF / Print
                </button>
            </div>

            {/* MAIN PRINTABLE AREA */}
            <div className="space-y-6">

                {/* Print Only Header - Enhanced with Colors */}
                <div className="hidden print:block pdf-header mb-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold uppercase tracking-wide">Task Management Report</h1>
                            <div className="pdf-header-line my-3"></div>
                            <p className="text-base font-semibold opacity-90">{appConfig.appName}</p>
                        </div>
                        <div className="text-right ml-4">
                            <div className="period-badge mb-2">
                                Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </div>
                            <p className="text-xs opacity-80">Generated: {new Date().toLocaleDateString('id-ID')}</p>
                            <p className="text-xs opacity-80">User: {currentUser?.fullName}</p>
                        </div>
                    </div>
                </div>

                {/* --- SUMMARY CARDS --- */}
                <div className="print-section print-no-break">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-1 uppercase hidden print:block">1. Executive Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 card flex flex-col justify-between">
                            <p className="text-sm font-bold text-slate-400 uppercase">Total SPV</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-indigo-600">{usersList.filter(u => u.role === 'SUPERVISOR').length}</h3>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg no-print"><UserCog size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 card flex flex-col justify-between">
                            <p className="text-sm font-bold text-slate-400 uppercase">Total</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-slate-800">{totalTasks}</h3>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg no-print"><CheckSquare size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 card flex flex-col justify-between">
                            <p className="text-sm font-bold text-slate-400 uppercase">Open</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-slate-600">{openTasks}</h3>
                                <div className="p-2 bg-slate-50 text-slate-500 rounded-lg no-print"><Clock size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 card flex flex-col justify-between">
                            <p className="text-sm font-bold text-slate-400 uppercase">Pending</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-orange-600">{pendingTasks}</h3>
                                <div className="p-2 bg-orange-50 text-orange-500 rounded-lg no-print"><Clock size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 card flex flex-col justify-between">
                            <p className="text-sm font-bold text-slate-400 uppercase">Ongoing</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-purple-600">{ongoingTasks}</h3>
                                <div className="p-2 bg-purple-50 text-purple-500 rounded-lg no-print"><AlertTriangle size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 card flex flex-col justify-between">
                            <p className="text-sm font-bold text-slate-400 uppercase">Done</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-emerald-600">{completedTasks}</h3>
                                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg no-print"><CheckCircle2 size={24} /></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PROGRESS --- */}
                <div className="print-section print-no-break">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-1 uppercase hidden print:block">2. Completion Progress</h3>
                    <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 card">
                        <h4 className="font-bold text-slate-700 mb-4 no-print">Progress by Principle</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {progressByPrinciple.map((item: any) => (
                                <div key={item.name} className="mb-2 break-inside-avoid">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-bold text-slate-700">{item.name}</span>
                                        <span className="font-bold text-blue-600">{item.pct}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-4 mb-1 border border-slate-200">
                                        <div className="bg-blue-600 h-4 rounded-full flex items-center justify-end pr-2 text-white text-[10px] font-bold print:bg-blue-700" style={{ width: `${item.pct}%` }}>
                                            {item.pct > 10 && `${item.pct}%`}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 text-right font-medium">{item.done}/{item.total} Done</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="page-break"></div>

                {/* --- CHART --- */}
                <div className="print-section print-no-break">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-1 uppercase hidden print:block">3. Analytics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Donut Chart 1: Tasks by Principle */}
                        <DonutChart
                            title="Tasks by Principle"
                            data={tasksByPrinciple}
                            dataKey="value"
                            nameKey="name"
                            colors={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']}
                        />

                        {/* Donut Chart 2: Tasks by Supervisor */}
                        <DonutChart
                            title="Tasks by Supervisor"
                            data={tasksBySupervisor}
                            dataKey="value"
                            nameKey="name"
                            colors={['#82ca9d', '#8884d8', '#ffc658', '#ff7300', '#0088FE']}
                        />
                    </div>
                </div>

                {/* --- TABLE --- */}
                <div className="print-section table-section">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-1 uppercase hidden print:block">Detailed Tasks</h3>
                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden print:overflow-visible card">
                        {/* Responsive Scroll for Mobile */}
                        <div className="overflow-x-auto print:overflow-visible">
                            <table className="w-full text-left text-xs min-w-[650px] md:min-w-full">
                                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase">
                                    <tr>
                                        <th className="p-3">Task Name</th>
                                        <th className="p-3">Assigned To</th>
                                        <th className="p-3 text-center">Deadline</th>
                                        <th className="p-3 text-center">Priority</th>
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-center">Approval</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {enrichedTasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-slate-50 break-inside-avoid">
                                            <td className="p-3 font-bold text-slate-800">{task.title}</td>
                                            <td className="p-3">
                                                <div className="font-bold text-slate-700">{task.supervisorName}</div>
                                                <div className="text-[10px] text-slate-500">{task.principle}</div>
                                            </td>
                                            <td className="p-3 text-center text-slate-600">{task.dueDate}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${task.priority === 'HIGH' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center font-bold text-slate-700">{task.status}</td>
                                            <td className="p-3 text-center">
                                                {task.approvalStatus === 'APPROVED' ? <span className="text-emerald-600 font-bold">Approved</span> : task.approvalStatus === 'REJECTED' ? <span className="text-red-600 font-bold">Rejected</span> : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
