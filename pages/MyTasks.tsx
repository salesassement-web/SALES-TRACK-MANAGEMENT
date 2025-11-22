import React, { useState } from 'react';
import { useApp } from '../src/context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { CheckSquare, Clock, AlertTriangle, Plus, Calendar, Play, CheckCircle2, Camera, X, Save, Info } from 'lucide-react';

export const MyTasks: React.FC = () => {
  const { tasks, currentUser, addTask, updateTask } = useApp();
  
  // State for Filters
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

  // State for Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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

  // Handlers
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      addTask({
        supervisorId: currentUser.id,
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
    setExecuteData({
      timeIn: task.timeIn || '',
      timeOut: task.timeOut || '',
      attachment: task.attachment || ''
    });
    setIsExecuteModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setExecuteData(prev => ({ ...prev, attachment: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleExecuteSave = () => {
    if (!activeTask) return;

    let newStatus = activeTask.status;

    // Logic requested:
    // Time In only -> PENDING
    // Time In + Out -> ONGOING
    // Time In + Out + Attachment -> COMPLETED

    if (executeData.timeIn && !executeData.timeOut) {
        newStatus = TaskStatus.PENDING;
    } else if (executeData.timeIn && executeData.timeOut && !executeData.attachment) {
        newStatus = TaskStatus.ONGOING;
    } else if (executeData.timeIn && executeData.timeOut && executeData.attachment) {
        newStatus = TaskStatus.COMPLETED;
    }

    updateTask({
        ...activeTask,
        timeIn: executeData.timeIn,
        timeOut: executeData.timeOut,
        attachment: executeData.attachment,
        status: newStatus
    });

    setIsExecuteModalOpen(false);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Tasks</h2>
        <p className="text-slate-500">Manage and execute your daily assignments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-2xl transition-shadow">
             <div className="mb-2 md:mb-0">
                <p className="text-slate-500 text-xs md:text-sm font-bold">Total Tasks</p>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">{totalTasks}</h3>
             </div>
             <div className="bg-blue-100 p-2 md:p-3 rounded-lg">
                <CheckSquare className="text-blue-600" size={20} />
             </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-2xl transition-shadow">
             <div className="mb-2 md:mb-0">
                <p className="text-slate-500 text-xs md:text-sm font-bold">Pending</p>
                <h3 className="text-2xl md:text-3xl font-bold text-orange-500 mt-1">{pendingTasks}</h3>
             </div>
             <div className="bg-orange-100 p-2 md:p-3 rounded-lg">
                <Clock className="text-orange-600" size={20} />
             </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-2xl transition-shadow">
             <div className="mb-2 md:mb-0">
                <p className="text-slate-500 text-xs md:text-sm font-bold">Ongoing</p>
                <h3 className="text-2xl md:text-3xl font-bold text-purple-500 mt-1">{ongoingTasks}</h3>
             </div>
             <div className="bg-purple-100 p-2 md:p-3 rounded-lg">
                <AlertTriangle className="text-purple-600" size={20} />
             </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-2xl transition-shadow">
             <div className="mb-2 md:mb-0">
                <p className="text-slate-500 text-xs md:text-sm font-bold">Completed</p>
                <h3 className="text-2xl md:text-3xl font-bold text-emerald-500 mt-1">{completedTasks}</h3>
             </div>
             <div className="bg-emerald-100 p-2 md:p-3 rounded-lg">
                <CheckCircle2 className="text-emerald-600" size={20} />
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
                        <th className="p-4 min-w-[150px]">Task Title</th>
                        <th className="p-4 min-w-[200px]">Description</th>
                        <th className="p-4 min-w-[120px]">Task Date</th>
                        <th className="p-4">Priority</th>
                        <th className="p-4 min-w-[120px]">Due Date</th>
                        <th className="p-4 text-center">Evidence</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredTasks.length > 0 ? filteredTasks.map((task, idx) => (
                        <tr key={task.id} className="hover:bg-slate-50">
                            <td className="p-4 text-slate-500">{idx + 1}</td>
                            <td className="p-4 font-bold text-slate-800">{task.title}</td>
                            <td className="p-4 text-slate-600 max-w-xs truncate" title={task.description}>{task.description}</td>
                            <td className="p-4 text-slate-500 whitespace-nowrap">{task.taskDate}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold
                                    ${task.priority === TaskPriority.HIGH ? 'bg-red-100 text-red-700' :
                                      task.priority === TaskPriority.MEDIUM ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                    {task.priority}
                                </span>
                            </td>
                            <td className="p-4 text-slate-500 whitespace-nowrap">{task.dueDate}</td>
                            <td className="p-4 text-center">
                                {task.attachment ? (
                                    <a href={task.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs font-bold">
                                        View Photo
                                    </a>
                                ) : (
                                    <span className="text-slate-300 text-xs">-</span>
                                )}
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
                            <td colSpan={9} className="p-8 text-center text-slate-400">
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
                    <h3 className="text-white font-bold flex items-center gap-2"><Plus size={20}/> Create New Task</h3>
                    <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white"><X size={20}/></button>
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
                                onChange={(e) => setNewTaskData({...newTaskData, taskDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                            <input 
                                type="date" 
                                required
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={newTaskData.dueDate}
                                onChange={(e) => setNewTaskData({...newTaskData, dueDate: e.target.value})}
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
                            onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
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
                            onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                        <select 
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={newTaskData.priority}
                            onChange={(e) => setNewTaskData({...newTaskData, priority: e.target.value as TaskPriority})}
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
                    <h3 className="text-white font-bold flex items-center gap-2"><Play size={20}/> Kerjakan Task</h3>
                    <button onClick={() => setIsExecuteModalOpen(false)} className="text-white/80 hover:text-white"><X size={20}/></button>
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
                                    onChange={(e) => setExecuteData({...executeData, timeIn: e.target.value})}
                                />
                                <button 
                                    onClick={() => setExecuteData({...executeData, timeIn: getCurrentTime()})}
                                    className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200"
                                    title="Current Time"
                                >
                                    <Clock size={18}/>
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
                                    onChange={(e) => setExecuteData({...executeData, timeOut: e.target.value})}
                                />
                                <button 
                                    onClick={() => setExecuteData({...executeData, timeOut: getCurrentTime()})}
                                    className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200"
                                    title="Current Time"
                                >
                                    <Clock size={18}/>
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
                                    <Camera size={32} className="mx-auto mb-2"/>
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
                        <Info size={16} className="shrink-0"/>
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

    </div>
  );
};
