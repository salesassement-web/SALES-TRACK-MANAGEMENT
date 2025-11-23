import React from 'react';

interface DonutChartProps {
    stay: number;
    leave: number;
    title: string;
    period: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({ stay, leave, title, period }) => {
    const total = stay + leave;
    const stayPercentage = total > 0 ? (stay / total) * 100 : 50;
    const leavePercentage = total > 0 ? (leave / total) * 100 : 50;

    // Calculate stroke dash for donut segments
    const radius = 70;
    const stroke = 20;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    const stayDash = (stayPercentage / 100) * circumference;
    const leaveDash = (leavePercentage / 100) * circumference;

    return (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 card">
            <div className="mb-4">
                <h4 className="font-bold text-slate-700 text-sm">{title}</h4>
                <p className="text-xs text-slate-400">{period}</p>
            </div>

            <div className="flex items-center justify-center relative">
                {/* SVG Donut Chart */}
                <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
                    {/* Stay segment (green) */}
                    <circle
                        stroke="#10b981"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={`${stayDash} ${circumference}`}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    {/* Leave segment (red) */}
                    <circle
                        stroke="#ef4444"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={`${leaveDash} ${circumference}`}
                        strokeDashoffset={-stayDash}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>

                {/* Center text - Total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-slate-800">{total}</div>
                    <div className="text-xs text-slate-400">Total</div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-slate-600">Stay</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{stay}</span>
                        <span className="text-xs text-slate-400">({stayPercentage.toFixed(0)}%)</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-slate-600">Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{leave}</span>
                        <span className="text-xs text-slate-400">({leavePercentage.toFixed(0)}%)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
