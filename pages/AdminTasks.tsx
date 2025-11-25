import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus, TaskPriority } from '../types';
import { CheckSquare, Clock, AlertTriangle, CheckCircle2, BarChart2, Filter, Calendar, X, Check, Eye, Printer, UserCog } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LabelList, ComposedChart, Line } from 'recharts';
import { CircularProgress } from '../components/CircularProgress';

export const AdminTasks: React.FC = () => {
    const { tasks, usersList, principles, updateTask, appConfig, currentUser } = useApp();

    // Filter States
    const [timeFilter, setTimeFilter] = useState<'WEEK' | 'MONTH' | 'YEAR'>('WEEK');
    const [groupFilter, setGroupFilter] = useState<'SUPERVISOR' | 'PRINCIPLE'>('PRINCIPLE');

    // Enriched Data
    const enrichedTasks = useMemo(() => {
        return tasks.map(task => {
            // Try to find supervisor by ID first, then by Name (Case Insensitive)
            const normalize = (str: string) => str?.toString().toLowerCase().trim() || '';
            const supervisor = usersList.find(u => u.id === task.supervisorId || normalize(u.fullName) === normalize(task.supervisorId));
            return {
                ...task,
                supervisorName: supervisor?.fullName || 'Unknown',
                // DON'T overwrite task.principle - it already exists in task object
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

    // Stacked Bar Chart Data 1: Status by Principle
    const statusByPrinciple = useMemo(() => {
        const data: Record<string, any> = {};

        // Initialize
        principles.forEach(p => {
            if (p !== 'ALL PRINCIPLE' && p !== 'ALL SANCHO') {
                data[p] = { name: p, [TaskStatus.COMPLETED]: 0, [TaskStatus.ONGOING]: 0, [TaskStatus.PENDING]: 0, [TaskStatus.OPEN]: 0 };
            }
        });

        enrichedTasks.forEach(task => {
            const p = task.principle;
            if (data[p]) {
                data[p][task.status] = (data[p][task.status] || 0) + 1;
            } else if (p && p !== 'Unknown') {
                // Handle principles not in the initial list
                if (!data[p]) data[p] = { name: p, [TaskStatus.COMPLETED]: 0, [TaskStatus.ONGOING]: 0, [TaskStatus.PENDING]: 0, [TaskStatus.OPEN]: 0 };
                data[p][task.status] = (data[p][task.status] || 0) + 1;
            }
        });

        return Object.values(data).filter(item =>
            item[TaskStatus.COMPLETED] + item[TaskStatus.ONGOING] + item[TaskStatus.PENDING] + item[TaskStatus.OPEN] > 0
        );
    }, [enrichedTasks, principles]);

    // Stacked Bar Chart Data 2: Status by Supervisor
    const statusBySupervisor = useMemo(() => {
        const data: Record<string, any> = {};

        enrichedTasks.forEach(task => {
            const name = task.supervisorName;
            if (name !== 'Unknown') {
                if (!data[name]) data[name] = { name: name, [TaskStatus.COMPLETED]: 0, [TaskStatus.ONGOING]: 0, [TaskStatus.PENDING]: 0, [TaskStatus.OPEN]: 0 };
                data[name][task.status] = (data[name][task.status] || 0) + 1;
            }
        });

        return Object.values(data).sort((a: any, b: any) => {
            const totalA = a[TaskStatus.COMPLETED] + a[TaskStatus.ONGOING] + a[TaskStatus.PENDING] + a[TaskStatus.OPEN];
            const totalB = b[TaskStatus.COMPLETED] + b[TaskStatus.ONGOING] + b[TaskStatus.PENDING] + b[TaskStatus.OPEN];
            return totalB - totalA;
        });
    }, [enrichedTasks]);

    // Calculate active principles and supervisors (those with running tasks)
    const activePrinciples = useMemo(() => {
        const runningTasks = enrichedTasks.filter(t => t.status !== TaskStatus.COMPLETED);
        return new Set(runningTasks.map(t => t.principle).filter(p => p !== 'Unknown')).size;
    }, [enrichedTasks]);

    const activeSupervisors = useMemo(() => {
        const runningTasks = enrichedTasks.filter(t => t.status !== TaskStatus.COMPLETED);
        return new Set(runningTasks.map(t => t.supervisorName).filter(s => s !== 'Unknown')).size;
    }, [enrichedTasks]);

    const CustomBarChart = ({ title, data }: { title: string, data: any[] }) => (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 card h-[400px] flex flex-col text-white">
            <h4 className="font-bold text-white mb-4">{title}</h4>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} interval={0} angle={-45} textAnchor="end" height={60} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', color: '#fff' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#fff' }} />
                        {/* Bars for stacked statuses */}
                        <Bar dataKey={TaskStatus.ONGOING} name="Ongoing" stackId="a" fill="#a78bfa">
                            <LabelList dataKey={TaskStatus.ONGOING} position="inside" fill="#fff" fontSize={10} fontWeight="bold" />
                        </Bar>
                        <Bar dataKey={TaskStatus.PENDING} name="Pending" stackId="a" fill="#fb923c">
                            <LabelList dataKey={TaskStatus.PENDING} position="inside" fill="#fff" fontSize={10} fontWeight="bold" />
                        </Bar>
                        <Bar dataKey={TaskStatus.OPEN} name="Open" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]}>
                            <LabelList dataKey={TaskStatus.OPEN} position="inside" fill="#1e293b" fontSize={10} fontWeight="bold" />
                        </Bar>
                        {/* Smooth Line with Dots for Completed */}
                        <Line
                            type="monotone"
                            dataKey={TaskStatus.COMPLETED}
                            name="Completed"
                            stroke="#34d399"
                            strokeWidth={3}
                            dot={{ fill: '#34d399', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                            label={{ position: 'top', fill: '#34d399', fontSize: 11, fontWeight: 'bold' }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    // DEBUG DATA
    const debugData = useMemo(() => {
        const uniqueSupervisorIds = Array.from(new Set(tasks.map(t => t.supervisorId)));
        return uniqueSupervisorIds.map((id: string) => {
            const normalize = (str: string) => str?.toString().toLowerCase().trim() || '';
            const match = usersList.find(u => u.id === id || normalize(u.fullName) === normalize(id));
            return {
                originalId: id,
                mappedName: match?.fullName || 'FAILED',
                mappedPrinciple: match?.principle || 'FAILED'
            };
        });
    }, [tasks, usersList]);

    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [viewTask, setViewTask] = useState<any | null>(null);

    const openAttachmentModal = (task: any) => {
        setViewTask(task);
        setIsAttachmentModalOpen(true);
    };

    return (
        <div className="w-full print-content">
            {/* ... (existing controls) ... */}
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

            {/* ... (rest of the component) ... */}
            <div className="space-y-6">
                {/* ... (headers, summary cards, charts) ... */}

                {/* Print Only Header */}
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
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 card flex flex-col justify-between text-white">
                            <p className="text-sm font-bold text-slate-400 uppercase">Total SPV</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-indigo-400">{usersList.filter(u => u.role === 'SUPERVISOR').length}</h3>
                                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg no-print"><UserCog size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 card flex flex-col justify-between text-white">
                            <p className="text-sm font-bold text-slate-400 uppercase">Total</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-white">{totalTasks}</h3>
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg no-print"><CheckSquare size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 card flex flex-col justify-between text-white">
                            <p className="text-sm font-bold text-slate-400 uppercase">Open</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-slate-400">{openTasks}</h3>
                                <div className="p-2 bg-slate-500/20 text-slate-400 rounded-lg no-print"><Clock size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 card flex flex-col justify-between text-white">
                            <p className="text-sm font-bold text-slate-400 uppercase">Pending</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-orange-400">{pendingTasks}</h3>
                                <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg no-print"><Clock size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 card flex flex-col justify-between text-white">
                            <p className="text-sm font-bold text-slate-400 uppercase">Ongoing</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-purple-400">{ongoingTasks}</h3>
                                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg no-print"><AlertTriangle size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 card flex flex-col justify-between text-white">
                            <p className="text-sm font-bold text-slate-400 uppercase">Done</p>
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl md:text-4xl font-bold text-emerald-400">{completedTasks}</h3>
                                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg no-print"><CheckCircle2 size={24} /></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TASK PROGRESS CIRCULAR CARD --- */}
                <div className="print-section">
                    <CircularProgress
                        title="Task Progress"
                        percentage={totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}
                        total={totalTasks}
                        completed={completedTasks}
                        pending={pendingTasks + ongoingTasks}
                        labelCompleted="Tasks Completed"
                        labelPending="Tasks Hold"
                        labelRunning="Running Task"
                        activePrinciples={activePrinciples}
                        activeSupervisors={activeSupervisors}
                    />
                </div>

                {/* --- PROGRESS --- */}
                <div className="print-section print-no-break">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-1 uppercase hidden print:block">2. Completion Progress</h3>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 card text-white">
                        <h4 className="font-bold text-white mb-4 no-print">Progress by Principle</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {progressByPrinciple.map((item: any) => (
                                <div key={item.name} className="mb-2 break-inside-avoid">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-bold text-slate-300">{item.name}</span>
                                        <span className="font-bold text-blue-400">{item.pct}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-4 mb-1 border border-slate-600">
                                        <div className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2 text-white text-[10px] font-bold print:bg-blue-700" style={{ width: `${item.pct}%` }}>
                                            {item.pct > 10 && `${item.pct}%`}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 text-right font-medium">{item.done}/{item.total} Done</div>
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
                        {/* Stacked Bar Chart 1: Status by Principle */}
                        <CustomBarChart title="Task Status by Principle" data={statusByPrinciple} />

                        {/* Stacked Bar Chart 2: Status by Supervisor */}
                        <CustomBarChart title="Task Status by Supervisor" data={statusBySupervisor} />
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
                                        <th className="p-3">ID Task</th>
                                        <th className="p-3">Principle</th>
                                        <th className="p-3">Supervisor</th>
                                        <th className="p-3">Title</th>
                                        <th className="p-3">Description</th>
                                        <th className="p-3 text-center">Priority</th>
                                        <th className="p-3 text-center">Time In</th>
                                        <th className="p-3 text-center">Time Out</th>
                                        <th className="p-3 text-center">Attachment</th>
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-center">Approval</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {enrichedTasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-slate-50 break-inside-avoid">
                                            <td className="p-3 font-mono text-[10px] text-slate-600">{task.id}</td>
                                            <td className="p-3 text-slate-700 font-bold">{task.principle}</td>
                                            <td className="p-3">
                                                <div className="font-bold text-slate-700">{task.supervisorName}</div>
                                            </td>
                                            <td className="p-3 font-bold text-slate-800">{task.title}</td>
                                            <td className="p-3 text-slate-600 max-w-[200px] truncate" title={task.description}>{task.description}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${task.priority === 'HIGH' ? 'bg-red-100 text-red-700 border-red-200' : task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center text-slate-600">
                                                {task.timeIn ? (
                                                    task.timeIn.includes('T')
                                                        ? new Date(task.timeIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                                        : task.timeIn
                                                ) : '-'}
                                            </td>
                                            <td className="p-3 text-center text-slate-600">
                                                {task.timeOut ? (
                                                    task.timeOut.includes('T')
                                                        ? new Date(task.timeOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                                        : task.timeOut
                                                ) : '-'}
                                            </td>
                                            <td className="p-3 text-center">
                                                {task.attachment ? (
                                                    <button
                                                        onClick={() => openAttachmentModal(task)}
                                                        className="text-blue-600 hover:underline text-[10px] font-bold cursor-pointer"
                                                    >
                                                        View
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                                    ${task.status === TaskStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                                                        task.status === TaskStatus.ONGOING ? 'bg-purple-100 text-purple-700' :
                                                            task.status === TaskStatus.PENDING ? 'bg-orange-100 text-orange-700' :
                                                                'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {task.approvalStatus ? (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${task.approvalStatus === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                                        task.approvalStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {task.approvalStatus === 'APPROVED' && <CheckCircle2 size={12} />}
                                                        {task.approvalStatus === 'REJECTED' && <X size={12} />}
                                                        {task.approvalStatus === 'WAITING' && <Clock size={12} />}
                                                        {task.approvalStatus}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

            {/* ATTACHMENT DETAIL MODAL */}
            {isAttachmentModalOpen && viewTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm p-4 no-print">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center gap-2"><Eye size={20} /> Task Evidence Detail</h3>
                            <button onClick={() => setIsAttachmentModalOpen(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            {/* Task Info */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h4 className="font-bold text-slate-800 text-lg mb-2">{viewTask.title}</h4>
                                <p className="text-sm text-slate-600 mb-3">{viewTask.description}</p>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-500 font-semibold">Supervisor:</span>
                                        <p className="text-slate-700 font-bold">{viewTask.supervisorName}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-semibold">Principle:</span>
                                        <p className="text-slate-700 font-bold">{viewTask.principle}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-semibold">Task Date:</span>
                                        <p className="text-slate-700">
                                            {viewTask.taskDate ? new Date(viewTask.taskDate).toLocaleDateString('id-ID', {
                                                day: '2-digit', month: 'long', year: 'numeric'
                                            }) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-semibold">Status:</span>
                                        <p>
                                            <span className={`px-2 py-1 rounded text-xs font-bold inline-block mt-1
                                                ${viewTask.status === TaskStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    viewTask.status === TaskStatus.PENDING ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                                        viewTask.status === TaskStatus.ONGOING ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                            'bg-slate-50 text-slate-500 border border-slate-200'
                                                }`}>
                                                {viewTask.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Photo Evidence */}
                            <div>
                                <h5 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Eye size={18} /> Photo Evidence
                                </h5>
                                <div className="w-full bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200">
                                    {viewTask.attachment ? (
                                        <img
                                            src={viewTask.attachment}
                                            alt="Task Evidence"
                                            className="w-full h-auto object-contain max-h-96"
                                        />
                                    ) : (
                                        <div className="p-8 text-center text-slate-400">
                                            <Eye size={48} className="mx-auto mb-2 opacity-30" />
                                            <p>No photo attached</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
