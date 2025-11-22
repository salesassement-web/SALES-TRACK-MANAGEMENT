import React, { useState } from 'react';
import { useApp } from '../src/context/AppContext';
import { Download, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import * as XLSX from 'xlsx';

export const AdminExport: React.FC = () => {
  const { salesList, usersList, evaluations, tasks, principles, kpiConfig, appConfig } = useApp();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Helper to download JSON file
  const downloadJSON = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackup = async () => {
    setIsExporting(true);
    setIsSuccess(false);

    try {
        // Simulate processing delay for UX
        await new Promise(resolve => setTimeout(resolve, 800));

        // --- 1. PREPARE DATA FOR EXCEL ---

        // SHEET 1: ALL ASSESSMENT
        // Flatten the data to make it friendly for Excel rows
        const assessmentRows: any[] = [];
        
        salesList.forEach(sales => {
            const salesEvals = evaluations.filter(e => e.salesId === sales.id);
            
            if (salesEvals.length === 0) {
                // Entry for unrated sales
                assessmentRows.push({
                    'Sales ID': sales.id,
                    'Full Name': sales.fullName,
                    'Principle': sales.principle,
                    'Supervisor': sales.supervisorName,
                    'Join Date': sales.joinDate,
                    'Month/Year': '-',
                    'Score SPV': 0,
                    'Score Kasir': 0,
                    'Score HRD': 0,
                    'Final Score': 0,
                    'Status': 'UNRATED'
                });
            } else {
                // Entry for each evaluation
                salesEvals.forEach(ev => {
                    const calcSection = (section: 'supervisor' | 'kasir' | 'hrd') => {
                        const config = kpiConfig[section];
                        let raw = 0;
                        config.criteria.forEach(c => {
                            raw += (ev.scores[c.key] || 0) * c.weight;
                        });
                        return parseFloat((raw * config.totalWeight).toFixed(2));
                    };

                    assessmentRows.push({
                        'Sales ID': sales.id,
                        'Full Name': sales.fullName,
                        'Principle': sales.principle,
                        'Supervisor': sales.supervisorName,
                        'Join Date': sales.joinDate,
                        'Month/Year': `${ev.month}/${ev.year}`,
                        'Score SPV': calcSection('supervisor'),
                        'Score Kasir': calcSection('kasir'),
                        'Score HRD': calcSection('hrd'),
                        'Final Score': ev.finalScore,
                        'Status': ev.status
                    });
                });
            }
        });

        // SHEET 2: ALL TASKS
        const taskRows = tasks.map(t => {
            const supervisor = usersList.find(u => u.id === t.supervisorId);
            const supervisorName = supervisor?.fullName || 'Unknown';
            const principle = supervisor?.principle || 'Unknown';

            return {
                'Task ID': t.id,
                'Title': t.title,
                'Description': t.description,
                'Supervisor': supervisorName,
                'Principle': principle,
                'Task Date': t.taskDate,
                'Due Date': t.dueDate,
                'Priority': t.priority,
                'Status': t.status,
                'Time In': t.timeIn || '',
                'Time Out': t.timeOut || '',
                'Approval Status': t.approvalStatus || 'PENDING',
                'Has Attachment': t.attachment ? 'YES' : 'NO'
            };
        });

        // GENERATE EXCEL FILE WITH 2 SHEETS
        const wb = XLSX.utils.book_new();
        
        // Add All Assessment Sheet
        const ws1 = XLSX.utils.json_to_sheet(assessmentRows);
        // Auto-width for columns (basic heuristic)
        const wscols1 = Object.keys(assessmentRows[0] || {}).map(() => ({ wch: 15 }));
        ws1['!cols'] = wscols1;
        XLSX.utils.book_append_sheet(wb, ws1, "All Assessment");

        // Add All Tasks Sheet
        const ws2 = XLSX.utils.json_to_sheet(taskRows);
        const wscols2 = Object.keys(taskRows[0] || {}).map(() => ({ wch: 15 }));
        ws2['!cols'] = wscols2;
        XLSX.utils.book_append_sheet(wb, ws2, "All Tasks");

        // Write Excel
        XLSX.writeFile(wb, `SalesForce_Report_${new Date().toISOString().split('T')[0]}.xlsx`);


        // --- 2. GENERATE JSON BACKUP ---
        const fullBackupData = {
            timestamp: new Date().toISOString(),
            appConfig,
            kpiConfig,
            principles,
            users: usersList,
            salesTeam: salesList,
            evaluations,
            tasks
        };
        const jsonString = JSON.stringify(fullBackupData, null, 2);
        downloadJSON(jsonString, `SalesForce_FullBackup_${new Date().toISOString().split('T')[0]}.json`);

        setIsSuccess(true);
    } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export data.");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8 w-full">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Export & Backup Data</h2>
        <p className="text-slate-500">Download system data for reporting and backup purposes</p>
      </div>

      <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-shadow">
        <div className="bg-blue-600 p-8 text-white text-center">
            <Database size={64} className="mx-auto mb-4 opacity-80"/>
            <h3 className="text-2xl font-bold">System Data Export</h3>
            <p className="text-blue-100 mt-2">One-click solution: Generates Excel Report (2 Sheets) and a JSON Backup.</p>
        </div>
        
        <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border rounded-xl p-6 hover:bg-slate-50 transition-colors flex items-start gap-4">
                    <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                        <FileSpreadsheet size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">Excel Report (.xlsx)</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            Single file containing 2 Sheets:
                            <br/>1. <strong>All Assessment</strong> (Sales Evaluation)
                            <br/>2. <strong>All Tasks</strong> (Monitoring Data)
                        </p>
                    </div>
                </div>

                <div className="border rounded-xl p-6 hover:bg-slate-50 transition-colors flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                        <FileJson size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">JSON Full Backup</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            Complete raw data structure including Configs, Users, and raw Scores for system restore.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center">
                <button 
                    onClick={handleBackup}
                    disabled={isExporting}
                    className="w-full md:w-auto bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-900 transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                >
                    {isExporting ? (
                        <>Processing Export...</>
                    ) : (
                        <>
                            <Download size={24} /> EXPORT ALL DATA
                        </>
                    )}
                </button>

                {/* Success Notification */}
                {isSuccess && (
                    <div className="mt-6 w-full animate-scale-in flex items-center gap-3 bg-emerald-50 text-emerald-800 px-6 py-4 rounded-xl border border-emerald-200 shadow-sm">
                        <CheckCircle2 size={24} className="text-emerald-600 shrink-0"/>
                        <span className="font-bold text-sm md:text-base">SEMUA DATA ANDA SUDAH DIBACKUP KE EXCEL DAN JSON</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 shadow-md">
         <AlertCircle className="text-blue-600 shrink-0" size={20} />
         <p className="text-sm text-blue-800">
             <strong>Note:</strong> This will download 2 files: "SalesForce_Report.xlsx" (Excel) and "SalesForce_FullBackup.json". Please allow multiple downloads if your browser asks.
         </p>
      </div>
    </div>
  );
};
