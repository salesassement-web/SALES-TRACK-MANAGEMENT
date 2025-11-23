import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScoreData } from '../types';
import { CircularProgress } from '../components/CircularProgress';
import { Users, AlertCircle, CheckCircle, ClipboardCheck, Printer } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export const Dashboard: React.FC = () => {
  const { salesList, evaluations, usersList, principles, currentUser, kpiConfig, appConfig } = useApp();

  const [dashboardFilter, setDashboardFilter] = useState<'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'LAST_QUARTER' | 'THIS_YEAR' | 'LAST_YEAR'>('THIS_MONTH');

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

  const getFilteredEvaluations = () => {
    return dashboardEvaluations.filter(ev => {
      const evMonth = ev.month;
      const evYear = ev.year;
      const evQuarter = Math.ceil(evMonth / 3);

      switch (dashboardFilter) {
        case 'THIS_MONTH':
          return evMonth === currentMonth && evYear === currentYear;
        case 'LAST_MONTH':
          const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
          const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
          return evMonth === lastMonth && evYear === lastMonthYear;
        case 'THIS_QUARTER':
          return evQuarter === currentQuarter && evYear === currentYear;
        case 'LAST_QUARTER':
          const lastQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
          const lastQuarterYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
          return evQuarter === lastQuarter && evYear === lastQuarterYear;
        case 'THIS_YEAR':
          return evYear === currentYear;
        case 'LAST_YEAR':
          return evYear === currentYear - 1;
        default:
          return evMonth === currentMonth && evYear === currentYear;
      }
    });
  };

  const filteredEvaluations = getFilteredEvaluations();

  const getStatusData = () => {
    // Use the globally filtered evaluations
    const filteredEvals = filteredEvaluations;

    // Only count evaluations that have at least one rated component (not empty placeholders)
    const validEvals = filteredEvals.filter(e => {
      return e.supervisorRated || e.kasirRated || e.hrdRated || (e.finalScore || 0) > 0;
    });

    const stayCount = validEvals.filter(e => {
      // Use existing status if available
      if (e.status === 'STAY') return true;
      if (e.status === 'LEAVE') return false;

      // Fallback calculation if status not set
      const totalScore = (e.finalScore || 0);
      return totalScore >= 75;
    }).length;

    const leaveCount = validEvals.filter(e => {
      // Use existing status if available
      if (e.status === 'LEAVE') return true;
      if (e.status === 'STAY') return false;

      // Fallback calculation
      const totalScore = (e.finalScore || 0);
      return totalScore < 75;
    }).length;

    return [
      { name: 'Stay', value: stayCount, color: '#fbbf24' },
      { name: 'Leave', value: leaveCount, color: '#94a3b8' }
    ];
  };

  const statusData = getStatusData();

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
      hrd: parseFloat(calcSection('hrd').toFixed(2)),
    };
  };

  const progressEvals = filteredEvaluations;
  const divisionProgressData = principles.map(principle => {
    if (principle === 'ALL PRINCIPLE' || principle === 'ALL SANCHO') return null;
    const divisionSales = dashboardSalesList.filter(s => s.principle === principle);
    const totalDiv = divisionSales.length;
    if (totalDiv === 0) return null;
    const ratedDiv = divisionSales.filter(s => progressEvals.some(e => e.salesId === s.id && e.supervisorRated && e.kasirRated && e.hrdRated)).length;
    return { name: principle, total: totalDiv, rated: ratedDiv, unrated: totalDiv - ratedDiv, percentage: Math.round((ratedDiv / totalDiv) * 100) };
  }).filter(Boolean);

  // Supervisor Progress Data
  const supervisorProgressData = usersList
    .filter(u => u.role === 'SUPERVISOR')
    .map(supervisor => {
      // Match by ID or Name to ensure data is caught
      const supervisorSales = dashboardSalesList.filter(s =>
        (s.supervisorId && s.supervisorId === supervisor.id) ||
        (s.supervisorName && s.supervisorName === supervisor.fullName)
      );
      const totalSpv = supervisorSales.length;
      if (totalSpv === 0) return null;

      const ratedSpv = supervisorSales.filter(s => progressEvals.some(e => e.salesId === s.id && e.supervisorRated && e.kasirRated && e.hrdRated)).length;

      return { name: supervisor.fullName, total: totalSpv, rated: ratedSpv, unrated: totalSpv - ratedSpv, percentage: Math.round((ratedSpv / totalSpv) * 100) };
    }).filter(Boolean);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const overviewEvals = filteredEvaluations;

  const getToday = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const today = new Date();
    return `${days[today.getDay()]}, ${monthsFull[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  };

  const Card = ({ title, value, sub, icon: Icon, color, customContent }: any) => (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 h-full card flex flex-col justify-between print-no-break hover:shadow-2xl transition-shadow text-white">
      <div className="flex justify-between items-start">
        <div className="w-full">
          <p className="text-slate-400 text-sm font-bold uppercase">{title}</p>
          {customContent ? customContent : (
            <>
              <h3 className="text-3xl md:text-4xl font-bold text-white mt-2">{value}</h3>
              {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
            </>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-20 ml-4 shadow-md no-print`}>
          <Icon size={32} className={color.replace('bg-', 'text-')} />
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
          <div className="flex items-center gap-4 mt-2">
            <div className="text-xs text-slate-500 font-medium">{months[currentMonth - 1]} {currentYear}</div>
            <select
              value={dashboardFilter}
              onChange={(e) => setDashboardFilter(e.target.value as any)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm no-print"
            >
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="THIS_QUARTER">This Quarter</option>
              <option value="LAST_QUARTER">Last Quarter</option>
              <option value="THIS_YEAR">This Year</option>
              <option value="LAST_YEAR">Last Year</option>
            </select>
          </div>
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
        {/* Print Only Header */}
        <div className="hidden print:block pdf-header mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold uppercase tracking-wide">Management Performance Report</h1>
              <div className="pdf-header-line my-3"></div>
              <p className="text-base font-semibold opacity-90">{appConfig.appName}</p>
            </div>
            <div className="text-right ml-4">
              <div className="period-badge mb-2">Periode: {months[currentMonth - 1]} {currentYear}</div>
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
                <div className="flex justify-between text-2xl font-bold mb-1">
                  <span className="text-white">{fullyRated}/{totalSales}</span>
                  <span className="text-emerald-400">{Math.round((fullyRated / totalSales) * 100) || 0}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full print:bg-emerald-600" style={{ width: `${(fullyRated / totalSales) * 100}%` }}></div>
                </div>
              </div>
            } />
            <Card title="Status Stay" value={currentStayCount} sub="Score > 75" icon={CheckCircle} color="bg-indigo-500" />
            <Card title="Status Leave" value={currentLeaveCount} sub="Score < 75" icon={AlertCircle} color="bg-red-500" />
          </div>
        </div>

        {/* GREETING CARD - DEDICATED SECTION */}
        <div className="print-section">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl shadow-2xl text-white border border-slate-700 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500 opacity-5 rounded-full -ml-10 -mb-10 blur-2xl"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
                Hi, {currentUser?.fullName || 'Admin'}! <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
              </h2>
              <p className="text-lg text-slate-300 font-medium mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {getToday()}
              </p>
              <div className="inline-block relative">
                <p className="text-xl md:text-2xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 animate-shimmer">
                  "STAY STRONG! YOU CAN ACHIEVE ANYTHING YOU SET YOUR MIND TO"
                </p>
                <div className="h-1 w-24 bg-yellow-500 mt-2 rounded-full opacity-50"></div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1.5: CIRCULAR PROGRESS & STATUS CHART */}
        <div className="print-section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CircularProgress
              title="Evaluation Progress"
              percentage={Math.round((fullyRated / totalSales) * 100) || 0}
              total={totalSales}
              completed={fullyRated}
              pending={totalSales - fullyRated}
              labelCompleted="Team Sudah Dinilai"
              labelPending="Belum Dinilai"
              labelRunning="Total Team"
            />

            {/* Status Stay vs Leave Chart - Dark Theme */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl text-white flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Status Stay vs Leave</h3>
                <div className="text-xs text-slate-300 bg-slate-700 px-2 py-1 rounded">
                  {dashboardFilter.replace('_', ' ')}
                </div>
              </div>
              <div className="flex-1 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <span className="text-3xl font-bold text-white">{statusData.reduce((a, b) => a + b.value, 0)}</span>
                  <span className="text-xs text-slate-400">Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PRINCIPLE & SUPERVISOR PROGRESS */}
        <div className="print-section print-no-break">
          <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-1 uppercase hidden print:block">2. Performance Progress</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress by Principle - Dark Theme */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 card text-white">
              <h4 className="font-bold text-white mb-4 no-print border-b border-slate-700 pb-2">Progress by Principle</h4>
              <div className="space-y-4">
                {divisionProgressData.map((div: any) => (
                  <div key={div.name} className="break-inside-avoid">
                    <div className="flex justify-between mb-1 font-bold text-sm text-slate-300">
                      <span>{div.name}</span>
                      <span className="text-white">{div.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-3 rounded-full border border-slate-600">
                      <div className={`h-3 rounded-full flex items-center justify-end pr-2 text-slate-900 text-[9px] font-bold bg-[#fbbf24]`} style={{ width: `${div.percentage}%` }}>
                        {div.percentage > 10 && `${div.percentage}%`}
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 mt-1">{div.rated} Rated / {div.unrated} Pending</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress by Supervisor - Dark Theme */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 card text-white">
              <h4 className="font-bold text-white mb-4 no-print border-b border-slate-700 pb-2">Progress by Supervisor</h4>
              <div className="space-y-4">
                {supervisorProgressData.map((spv: any) => (
                  <div key={spv.name} className="break-inside-avoid">
                    <div className="flex justify-between mb-1 font-bold text-sm text-slate-300">
                      <span>{spv.name}</span>
                      <span className="text-white">{spv.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-3 rounded-full border border-slate-600">
                      <div className={`h-3 rounded-full flex items-center justify-end pr-2 text-slate-900 text-[9px] font-bold bg-[#fbbf24]`} style={{ width: `${spv.percentage}%` }}>
                        {spv.percentage > 10 && `${spv.percentage}%`}
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 mt-1">{spv.rated} Rated / {spv.unrated} Pending</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="page-break"></div>

        {/* SECTION 4: TABLE */}
        <div className="print-section table-section">
          <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-1 uppercase hidden print:block">Team Detail Data</h3>
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 card overflow-hidden print:overflow-visible">
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-left text-xs min-w-[600px] md:min-w-full">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-3">Sales</th>
                    <th className="p-3">Principle</th>
                    <th className="p-3 text-center">SPV</th>
                    <th className="p-3 text-center">Kasir</th>
                    <th className="p-3 text-center">HRD</th>
                    <th className="p-3 text-center">Total</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardSalesList.map((sales) => {
                    const ev = overviewEvals.find(e => e.salesId === sales.id) || overviewEvals[overviewEvals.length - 1];
                    const scores = ev?.scores;
                    const breakdown = calculateBreakdown(scores);
                    const finalScore = ev?.finalScore || 0;
                    const status = ev?.status || 'PENDING';
                    return (
                      <tr key={sales.id} className="hover:bg-slate-50 break-inside-avoid">
                        <td className="p-3 font-bold text-slate-800">{sales.fullName}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{sales.principle}</span>
                        </td>
                        <td className="p-3 text-center">{breakdown.spv}</td>
                        <td className="p-3 text-center">{breakdown.kasir}</td>
                        <td className="p-3 text-center">{breakdown.hrd}</td>
                        <td className="p-3 text-center font-bold text-blue-600">{finalScore.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${status === 'STAY' ? 'bg-indigo-100 text-indigo-700' : status === 'LEAVE' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                            {status}
                          </span>
                        </td>
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
