import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScoreData } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, Area, LabelList
} from 'recharts';
import { Users, AlertCircle, CheckCircle, ClipboardCheck, Printer } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { salesList, evaluations, usersList, principles, currentUser, kpiConfig, appConfig } = useApp();

  const [trendFilter, setTrendFilter] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');
  const [progressFilter, setProgressFilter] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');
  const [overviewFilter, setOverviewFilter] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');

  const isSupervisor = currentUser?.role === 'SUPERVISOR';
  const dashboardSalesList = isSupervisor
    ? salesList.filter(s => s.supervisorName === currentUser.fullName)
    : salesList;

  const dashboardSalesIds = dashboardSalesList.map(s => s.id);
  const dashboardEvaluations = evaluations.filter(e => dashboardSalesIds.includes(e.salesId));

  const totalSales = dashboardSalesList.length;
  const supervisorsCount = isSupervisor ? 1 : usersList.filter(u => u.role === 'SUPERVISOR').length;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.ceil(currentMonth / 3);

  const currentStayCount = dashboardEvaluations.filter(e => e.status === 'STAY' && e.month === currentMonth && e.year === currentYear).length;
  const currentLeaveCount = dashboardEvaluations.filter(e => e.status === 'LEAVE' && e.month === currentMonth && e.year === currentYear).length;

  const currentMonthEvals = dashboardEvaluations.filter(e => e.month === currentMonth && e.year === currentYear);
  const fullyRated = currentMonthEvals.filter(e => e.supervisorRated && e.kasirRated && e.hrdRated).length;

  const getFilteredEvaluations = (filter: 'MONTH' | 'QUARTER' | 'YEAR') => {
    return dashboardEvaluations.filter(ev => {
      if (ev.year !== currentYear) return false;
      if (filter === 'MONTH') return ev.month === currentMonth;
      else if (filter === 'QUARTER') return Math.ceil(ev.month / 3) === currentQuarter;
      else return true;
    });
  };

  const calculateBreakdown = (scores: ScoreData | undefined) => {
    if (!scores) return { spv: 0, kasir: 0, hrd: 0 };
    const calcSection = (sectionKey: 'supervisor' | 'kasir' | 'hrd') => {
      const config = kpiConfig[sectionKey];
      let raw = 0;
      config.criteria.forEach(c => { raw += (scores[c.key] || 0) * c.weight; });
      return raw * config.totalWeight;
    };
    return {
      spv: parseFloat(calcSection('supervisor').toFixed(2)),
      kasir: parseFloat(calcSection('kasir').toFixed(2)),
      hrd: parseFloat(calcSection('hrd').toFixed(2))
    };
  };

  const progressEvals = getFilteredEvaluations(progressFilter);
  const divisionProgressData = principles.map(principle => {
    if (principle === 'ALL PRINCIPLE' || principle === 'ALL SANCHO') return null;
    const divisionSales = dashboardSalesList.filter(s => s.principle === principle);
    const totalDiv = divisionSales.length;
    if (totalDiv === 0) return null;
    const ratedDiv = divisionSales.filter(s => progressEvals.some(e => e.salesId === s.id && e.supervisorRated && e.kasirRated && e.hrdRated)).length;
    return { name: principle, total: totalDiv, rated: ratedDiv, unrated: totalDiv - ratedDiv, percentage: Math.round((ratedDiv / totalDiv) * 100) };
  }).filter(Boolean);

  const trendEvals = getFilteredEvaluations(trendFilter);
  const trendData = principles.filter(p => p !== 'ALL PRINCIPLE' && p !== 'ALL SANCHO').map(principle => {
    const principleSalesIds = dashboardSalesList.filter(s => s.principle === principle).map(s => s.id);
    if (principleSalesIds.length === 0) return null;
    const relevantEvals = trendEvals.filter(e => principleSalesIds.includes(e.salesId));
    return { name: principle, stay: relevantEvals.filter(e => e.status === 'STAY').length, leave: relevantEvals.filter(e => e.status === 'LEAVE').length };
  }).filter(Boolean);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyPerformanceData = months.map((monthName, index) => {
    const monthlyEvals = dashboardEvaluations.filter(e => e.month === index + 1 && e.year === currentYear);
    return { name: monthName, stay: monthlyEvals.filter(e => e.status === 'STAY').length, leave: monthlyEvals.filter(e => e.status === 'LEAVE').length };
  });

  const overviewEvals = getFilteredEvaluations(overviewFilter);

  const Card = ({ title, value, sub, icon: Icon, color, customContent }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 h-full card flex flex-col justify-between print-no-break hover:shadow-2xl transition-shadow">
      <div className="flex justify-between items-start">
        <div className="w-full">
          <p className="text-slate-500 text-sm font-bold uppercase">{title}</p>
          {customContent ? customContent : (
            <>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mt-2">{value}</h3>
              {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
            </>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} ml-4 shadow-md no-print`}>
          <Icon size={32} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full print-content">
      {/* Header Controls - No Print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Performance Dashboard</h2>
          <div className="text-xs text-slate-500 font-medium">{months[currentMonth - 1]} {currentYear}</div>
        </div>
        <button
          onClick={() => window.print()}
          type="button"
          className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors z-10 cursor-pointer"
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
              <h1 className="text-3xl font-bold uppercase tracking-wide">Management Performance Report</h1>
              <div className="pdf-header-line my-3"></div>
              <p className="text-base font-semibold opacity-90">{appConfig.appName}</p>
            </div>
            <div className="text-right ml-4">
              <div className="period-badge mb-2">
                Periode: {months[currentMonth - 1]} {currentYear}
              </div>
              <p className="text-xs opacity-80">Generated: {new Date().toLocaleDateString('id-ID')}</p>
              <p className="text-xs opacity-80">User: {currentUser?.fullName}</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: SUMMARY */}
        <div className="print-section">
          <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-1 uppercase hidden print:block">1. Executive Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card title="Total Sales Team" value={totalSales} sub={`${supervisorsCount} Supervisors`} icon={Users} color="bg-blue-500" />
            <Card title="Evaluation Progress" icon={ClipboardCheck} color="bg-emerald-500" customContent={
              <div className="mt-2">
                <div className="flex justify-between text-2xl font-bold mb-1"><span>{fullyRated}/{totalSales}</span><span className="text-emerald-600">{Math.round((fullyRated / totalSales) * 100) || 0}%</span></div>
                <div className="w-full bg-slate-200 rounded-full h-3"><div className="bg-emerald-500 h-3 rounded-full print:bg-emerald-600" style={{ width: `${(fullyRated / totalSales) * 100}%` }}></div></div>
              </div>
            } />
            <Card title="Status Stay" value={currentStayCount} sub="Score > 75" icon={CheckCircle} color="bg-indigo-500" />
            <Card title="Status Leave" value={currentLeaveCount} sub="Score < 75" icon={AlertCircle} color="bg-red-500" />
          </div>
        </div>

        {/* SECTION 2: PRINCIPLE PROGRESS */}
        <div className="print-section print-no-break">
          <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-1 uppercase hidden print:block">2. Principle Performance</h3>
          <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 card">
            <h4 className="font-bold text-slate-700 mb-4 no-print">Progress by Principle</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {divisionProgressData.map((div: any) => (
                <div key={div.name} className="mb-2 break-inside-avoid">
                  <div className="flex justify-between mb-2 font-bold text-sm text-slate-700">
                    <span>{div.name}</span><span>{div.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-full border border-slate-200">
                    <div className={`h-4 rounded-full flex items-center justify-end pr-2 text-white text-[10px] font-bold ${div.percentage === 100 ? 'bg-emerald-500 print:bg-emerald-600' : 'bg-blue-500 print:bg-blue-600'}`} style={{ width: `${div.percentage}%` }}>{div.percentage > 10 && `${div.percentage}%`}</div>
                  </div>
                  <div className="text-right text-xs text-slate-400 mt-1">{div.rated} Rated / {div.unrated} Pending</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="page-break"></div>

        {/* SECTION 3: CHARTS */}
        <div className="print-section">
          <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-1 uppercase hidden print:block">3. Analytics Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 card print-no-break h-[350px] flex flex-col">
              <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 shrink-0">Status Trend</h4>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="stay" name="Stay (>75)" fill="#10b981" stackId="a" isAnimationActive={false} radius={[0, 0, 4, 4]}>
                      {/* Label hanya muncul jika bar cukup tinggi */}
                    </Bar>
                    <Bar dataKey="leave" name="Leave (<75)" fill="#ef4444" stackId="a" isAnimationActive={false} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="leave" position="top" style={{ fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} formatter={(val: any) => val > 0 ? val : ''} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 card print-no-break h-[350px] flex flex-col">
              <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 shrink-0">Monthly Overview</h4>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyPerformanceData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="stay" name="Stay Trend" fill="#818cf8" fillOpacity={0.2} stroke="#818cf8" strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="leave" name="Leave Trend" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} isAnimationActive={false}>
                      <LabelList dataKey="leave" position="top" offset={10} style={{ fill: '#f43f5e', fontSize: 10, fontWeight: 'bold' }} formatter={(val: any) => val > 0 ? val : ''} />
                    </Line>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: TABLE (Allow Breaking) */}
        <div className="print-section table-section">
          <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-1 uppercase hidden print:block">Team Detail Data</h3>
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 card overflow-hidden print:overflow-visible">
            {/* Responsive Wrapper */}
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-left text-xs min-w-[600px] md:min-w-full">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr><th className="p-3">Sales</th><th className="p-3">Principle</th><th className="p-3 text-center">SPV</th><th className="p-3 text-center">Kasir</th><th className="p-3 text-center">HRD</th><th className="p-3 text-center">Total</th><th className="p-3 text-center">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardSalesList.map((sales) => {
                    const ev = overviewEvals.find(e => e.salesId === sales.id) || overviewEvals[overviewEvals.length - 1];
                    const bd = calculateBreakdown(ev?.scores);
                    return (
                      <tr key={sales.id} className="hover:bg-slate-50 break-inside-avoid">
                        <td className="p-3 font-bold">{sales.fullName}</td>
                        <td className="p-3">{sales.principle}</td>
                        <td className="p-3 text-center font-bold text-blue-600">{ev?.supervisorRated ? bd.spv : '-'}</td>
                        <td className="p-3 text-center font-bold text-emerald-600">{ev?.kasirRated ? bd.kasir : '-'}</td>
                        <td className="p-3 text-center font-bold text-orange-600">{ev?.hrdRated ? bd.hrd : '-'}</td>
                        <td className="p-3 text-center font-black text-slate-800">{ev?.finalScore || '-'}</td>
                        <td className="p-3 text-center"><span className={`px-2 py-1 rounded-full font-bold border ${ev?.status === 'STAY' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ev?.status === 'LEAVE' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{ev?.status || 'UNRATED'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};