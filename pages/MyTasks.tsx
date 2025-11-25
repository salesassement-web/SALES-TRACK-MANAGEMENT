import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { CheckSquare, Clock, AlertTriangle, Plus, Calendar, Play, CheckCircle2, Camera, X, Save, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MyTasks: React.FC = () => {
    const { tasks, currentUser, addTask, updateTask } = useApp();

    // State for Filters
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

    // State for Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [viewTask, setViewTask] = useState<Task | null>(null);

    // Create Form State
    const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
        title: '',
        description: '',
        taskDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        priority: TaskPriority.MEDIUM,
    });

    // Execute Form State
    const [executeData, setExecuteData] = useState<{
        timeIn: string;
        timeOut: string;
        attachment: string;
    }>({ timeIn: '', timeOut: '', attachment: '' });

    // Filter Tasks: Belong to current user & within date range
    const filteredTasks = tasks.filter(task => {
        const matchesUser = task.supervisorId === currentUser?.id;
        const matchesDate = task.taskDate >= startDate && task.taskDate <= endDate;
        return matchesUser && matchesDate;
    });

    // Stats
    const totalTasks = filteredTasks.length;
    const pendingTasks = filteredTasks.filter(t => t.status === TaskStatus.PENDING).length;
    const ongoingTasks = filteredTasks.filter(t => t.status === TaskStatus.ONGOING).length;
    const completedTasks = filteredTasks.filter(t => t.status === TaskStatus.COMPLETED).length;

    // Activity Data - Last 7 days
    const getActivityData = () => {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const today = new Date();
        const activityData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const tasksOnDate = tasks.filter(t =>
                t.supervisorId === currentUser?.id &&
                t.taskDate === dateStr
            ).length;
            activityData.push({
                day: days[date.getDay()],
                tasks: tasksOnDate,
                fullDate: dateStr
            });
        }
        return activityData;
    };
    const activityData = getActivityData();

    // Handlers
    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            addTask({
                supervisorId: currentUser.id,
                principle: currentUser.principle,
                title: newTaskData.title!,
                description: newTaskData.description!,
                taskDate: newTaskData.taskDate!,
                dueDate: newTaskData.dueDate!,
                priority: newTaskData.priority!,
                status: TaskStatus.OPEN,
            });
            setIsCreateModalOpen(false);
            // Reset
            setNewTaskData({
                title: '',
                description: '',
                taskDate: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                priority: TaskPriority.MEDIUM,
            });
        }
    };

    const openExecuteModal = (task: Task) => {
        setActiveTask(task);

        const formatTime = (timeStr: string | undefined) => {
            if (!timeStr) return '';
            if (timeStr.includes('T')) {
                try {
                    const date = new Date(timeStr);
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    return `${hours}:${minutes}`;
                } catch (e) {
                    return '';
                }
            }
            return timeStr;
        };

        setExecuteData({
            timeIn: formatTime(task.timeIn),
            timeOut: formatTime(task.timeOut),
            attachment: task.attachment || ''
        });
        setIsExecuteModalOpen(true);
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 600;
                    const MAX_HEIGHT = 600;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.5 quality
                    let dataUrl = canvas.toDataURL('image/jpeg', 0.5);

                    // If still too big (>45k), compress more
                    if (dataUrl.length > 45000) {
                        dataUrl = canvas.toDataURL('image/jpeg', 0.2);
                    }
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedBase64 = await compressImage(file);
                setExecuteData(prev => ({ ...prev, attachment: compressedBase64 }));
            } catch (error) {
                console.error("Image compression failed", error);
                alert("Failed to process image. Please try a smaller file.");
            }
        }
    };

    const handleExecuteSave = () => {
        if (!activeTask) return;

        let newStatus = activeTask.status;
        let newApprovalStatus = activeTask.approvalStatus;

        // Logic requested:
        // Time In only -> PENDING
        // Time In + Out -> ONGOING
        // Time In + Out + Attachment -> COMPLETED + AUTO APPROVED

        if (executeData.timeIn && !executeData.timeOut) {
            newStatus = TaskStatus.PENDING;
        } else if (executeData.timeIn && executeData.timeOut && !executeData.attachment) {
            newStatus = TaskStatus.ONGOING;
        } else if (executeData.timeIn && executeData.timeOut && executeData.attachment) {
            newStatus = TaskStatus.COMPLETED;
            newApprovalStatus = 'APPROVED'; // Auto-approve per user request
        }

        updateTask({
            ...activeTask,
            timeIn: executeData.timeIn,
            timeOut: executeData.timeOut,
            attachment: executeData.attachment,
            status: newStatus,
            approvalStatus: newApprovalStatus
        });

        setIsExecuteModalOpen(false);
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const openAttachmentModal = (task: Task) => {
        setViewTask(task);
        setIsAttachmentModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in w-full">
            {/* Personal Greeting Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Hi, {currentUser?.fullName || 'User'}👋</h2>
                    <p className="text-slate-500 mt-1">Let's finish your task today!</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {(currentUser?.fullName || 'U')[0]}
                </div>
            </div>

            {/* Running Task & Activity Cards - Dark Theme */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Running Task Card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl text-white">
                    <h3 className="text-lg font-bold mb-4">Running Task</h3>
                    <div className="flex items-center justify-between">
                        <div className="text-5xl font-bold">{pendingTasks + ongoingTasks}</div>
                        <div className="relative">
                            <svg width="80" height="80" className="transform -rotate-90">
                                <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
                                <circle cx="40" cy="40" r="32" stroke="#fbbf24" strokeWidth="8" fill="transparent"
                                    strokeDasharray={`${2 * Math.PI * 32}`}
                                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - completedTasks / (totalTasks || 1))}`}
                                    strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-lg font-bold">{Math.round((completedTasks / (totalTasks || 1)) * 100)}%</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white border-opacity-20 flex justify-between text-sm">
                        <div>
                            <div className="opacity-70">Total</div>
                            <div className="font-bold text-lg">{totalTasks}</div>
                        </div>
                        <div className="text-right">
                            <div className="opacity-70">Completed</div>
                            <div className="font-bold text-lg">{completedTasks}</div>
                        </div>
                    </div>
                </div>

                {/* Activity Chart - Dark Theme */}
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl text-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Activity</h3>
                        <select className="text-sm border border-white border-opacity-30 bg-transparent rounded-lg px-3 py-1 text-white">
                            <option className="bg-slate-800">This Week</option>
                            <option className="bg-slate-800">This Month</option>
                        </select>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', color: '#fff' }}
                                    labelFormatter={(label, payload) => {
                                        if (payload && payload[0]) return payload[0].payload.fullDate;
                                        return label;
                                    }}
                                />
                                <Line type="monotone" dataKey="tasks" stroke="#fbbf24" strokeWidth={3}
                                    dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 md:p-6 rounded-xl shadow-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-2xl transition-shadow text-white">
                    <div className="mb-2 md:mb-0">
                        <p className="text-slate-400 text-xs md:text-sm font-bold">Total Tasks</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">{totalTasks}</h3>
                    </div>
                    <div className="bg-blue-500/20 p-2 md:p-3 rounded-lg">
                        <CheckSquare className="text-blue-400" size={20} />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 md:p-6 rounded-xl shadow-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-2xl transition-shadow text-white">
                    <div className="mb-2 md:mb-0">
                        <p className="text-slate-400 text-xs md:text-sm font-bold">Pending</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-orange-400 mt-1">{pendingTasks}</h3>
                    </div>
                    <div className="bg-orange-500/20 p-2 md:p-3 rounded-lg">
                        <Clock className="text-orange-400" size={20} />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 md:p-6 rounded-xl shadow-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-2xl transition-shadow text-white">
                    <div className="mb-2 md:mb-0">
                        <p className="text-slate-400 text-xs md:text-sm font-bold">Ongoing</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-purple-400 mt-1">{ongoingTasks}</h3>
                    </div>
                    <div className="bg-purple-500/20 p-2 md:p-3 rounded-lg">
                        <AlertTriangle className="text-purple-400" size={20} />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 md:p-6 rounded-xl shadow-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-2xl transition-shadow text-white">
                    <div className="mb-2 md:mb-0">
                        <p className="text-slate-400 text-xs md:text-sm font-bold">Completed</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-emerald-400 mt-1">{completedTasks}</h3>
                    </div>
                    <div className="bg-emerald-500/20 p-2 md:p-3 rounded-lg">
                        <CheckCircle2 className="text-emerald-400" size={20} />
                    </div>
                </div>
            </div>

            {/* Filters & Action - Responsive Flex */}
            <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-4">
                    <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                        <div className="w-full md:w-auto">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center transition-colors shadow-lg"
                    >
                        <Plus size={18} className="mr-2" /> Create Task
                    </button>
                </div>
            </div>

            {/* Tasks Table */}
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                            <tr>
                                <th className="p-4 w-12">No</th>
                                <th className="p-4 min-w-[120px]">ID Task</th>
                                <th className="p-4 min-w-[150px]">Task Title</th>
                                <th className="p-4 min-w-[200px]">Description</th>
                                <th className="p-4 min-w-[120px]">Task Date</th>
                                <th className="p-4 min-w-[120px]">Due Date</th>
                                <th className="p-4">Priority</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Evidence</th>
                                <th className="p-4 text-center">Approval</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTasks.length > 0 ? filteredTasks.map((task, idx) => (
                                <tr key={task.id} className="hover:bg-slate-50">
                                    <td className="p-4 text-slate-500">{idx + 1}</td>
                                    <td className="p-4 font-mono text-xs text-slate-600">{task.id}</td>
                                    <td className="p-4 font-bold text-slate-800">{task.title}</td>
                                    <td className="p-4 text-slate-600 max-w-xs truncate" title={task.description}>{task.description}</td>
                                    <td className="p-4 text-slate-500 whitespace-nowrap">
                                        {task.taskDate ? new Date(task.taskDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="p-4 text-slate-500 whitespace-nowrap">
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold
                                    ${task.priority === TaskPriority.HIGH ? 'bg-red-100 text-red-700' :
                                                task.priority === TaskPriority.MEDIUM ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border
                                    ${task.status === TaskStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                task.status === TaskStatus.PENDING ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    task.status === TaskStatus.ONGOING ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {task.attachment ? (
                                            <button
                                                onClick={() => openAttachmentModal(task)}
                                                className="text-blue-600 hover:underline text-xs font-bold cursor-pointer"
                                            >
                                                View Photo
                                            </button>
                                        ) : (
                                            <span className="text-slate-300 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold
                                            ${task.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                task.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    task.approvalStatus === 'WAITING' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-slate-100 text-slate-400'
                                            }`}>
                                            {task.approvalStatus || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => openExecuteModal(task)}
                                            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                                            title="Kerjakan Task"
                                        >
                                            <Play size={14} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={11} className="p-8 text-center text-slate-400">
                                        No tasks found in this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE TASK MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        <div className="bg-blue-600 p-4 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center gap-2"><Plus size={20} /> Create New Task</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Task Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={newTaskData.taskDate}
                                        onChange={(e) => setNewTaskData({ ...newTaskData, taskDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={newTaskData.dueDate}
                                        onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Visit Mitra 10"
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={newTaskData.title}
                                    onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    required
                                    placeholder="Details of the task..."
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    value={newTaskData.description}
                                    onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                                <select
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={newTaskData.priority}
                                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as TaskPriority })}
                                >
                                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EXECUTE TASK MODAL */}
            {isExecuteModalOpen && activeTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        <div className="bg-emerald-600 p-4 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center gap-2"><Play size={20} /> Kerjakan Task</h3>
                            <button onClick={() => setIsExecuteModalOpen(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h4 className="font-bold text-slate-800">{activeTask.title}</h4>
                                <p className="text-sm text-slate-600 mt-1">{activeTask.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Time In</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="time"
                                            className="w-full p-2.5 border rounded-lg bg-slate-50"
                                            value={executeData.timeIn}
                                            onChange={(e) => setExecuteData({ ...executeData, timeIn: e.target.value })}
                                        />
                                        <button
                                            onClick={() => setExecuteData({ ...executeData, timeIn: getCurrentTime() })}
                                            className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200"
                                            title="Current Time"
                                        >
                                            <Clock size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Time Out</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="time"
                                            className="w-full p-2.5 border rounded-lg bg-slate-50"
                                            value={executeData.timeOut}
                                            onChange={(e) => setExecuteData({ ...executeData, timeOut: e.target.value })}
                                        />
                                        <button
                                            onClick={() => setExecuteData({ ...executeData, timeOut: getCurrentTime() })}
                                            className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200"
                                            title="Current Time"
                                        >
                                            <Clock size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Lampiran Foto (Evidence)</label>
                                <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center relative hover:bg-slate-50 transition-colors">
                                    {executeData.attachment ? (
                                        <img src={executeData.attachment} alt="Evidence" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <Camera size={32} className="mx-auto mb-2" />
                                            <span className="text-xs">Click to upload photo</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded border border-blue-100 text-xs text-blue-800 flex gap-2">
                                <Info size={16} className="shrink-0" />
                                <div>
                                    <p><strong>Auto-Status Logic:</strong></p>
                                    <ul className="list-disc pl-4 mt-1 space-y-1">
                                        <li>Time In only: <strong>Pending</strong></li>
                                        <li>Time In + Out: <strong>Ongoing</strong></li>
                                        <li>Time In + Out + Foto: <strong>Completed (Approved)</strong></li>
                                    </ul>
                                </div>
                            </div>

                            <button
                                onClick={handleExecuteSave}
                                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> Simpan & Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ATTACHMENT DETAIL MODAL */}
            {isAttachmentModalOpen && viewTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center gap-2"><Camera size={20} /> Task Evidence Detail</h3>
                            <button onClick={() => setIsAttachmentModalOpen(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            {/* Task Info */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h4 className="font-bold text-slate-800 text-lg mb-2">{viewTask.title}</h4>
                                <p className="text-sm text-slate-600 mb-3">{viewTask.description}</p>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-500 font-semibold">Task Date:</span>
                                        <p className="text-slate-700">
                                            {viewTask.taskDate ? new Date(viewTask.taskDate).toLocaleDateString('id-ID', {
                                                day: '2-digit', month: 'long', year: 'numeric'
                                            }) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-semibold">Due Date:</span>
                                        <p className="text-slate-700">
                                            {viewTask.dueDate ? new Date(viewTask.dueDate).toLocaleDateString('id-ID', {
                                                day: '2-digit', month: 'long', year: 'numeric'
                                            }) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-semibold">Time In:</span>
                                        <p className="text-slate-700">
                                            {viewTask.timeIn ? (
                                                viewTask.timeIn.includes('T')
                                                    ? new Date(viewTask.timeIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                                    : viewTask.timeIn
                                            ) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-semibold">Time Out:</span>
                                        <p className="text-slate-700">
                                            {viewTask.timeOut ? (
                                                viewTask.timeOut.includes('T')
                                                    ? new Date(viewTask.timeOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                                    : viewTask.timeOut
                                            ) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-semibold">Priority:</span>
                                        <p>
                                            <span className={`px-2 py-1 rounded text-xs font-bold inline-block mt-1
                                                ${viewTask.priority === TaskPriority.HIGH ? 'bg-red-100 text-red-700' :
                                                    viewTask.priority === TaskPriority.MEDIUM ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {viewTask.priority}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-semibold">Status:</span>
                                        <p>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block mt-1
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
                                    <Camera size={18} /> Photo Evidence
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
                                            <Camera size={48} className="mx-auto mb-2 opacity-30" />
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
