import React from 'react';

interface CircularProgressProps {
    percentage: number;
    total: number;
    completed: number;
    pending: number;
    title: string;
    color?: string;
    labelCompleted?: string;
    labelPending?: string;
    labelRunning?: string;
    activePrinciples?: number;
    activeSupervisors?: number;
    userName?: string;
    showGreeting?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    percentage,
    total,
    completed,
    pending,
    title,
    color = '#0077b6',
    labelCompleted = 'Project Completed',
    labelPending = 'Project Hold',
    labelRunning = 'Running Task',
    activePrinciples,
    activeSupervisors,
    userName,
    showGreeting = false
}) => {
    const radius = 95; // Further increased for larger, more prominent donut
    const stroke = 18; // Thicker ring for bolder appearance
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getToday = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const today = new Date();
        return `${days[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
    };

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
                {showGreeting && userName && (
                    <div className="mb-4 pb-4 border-b border-white border-opacity-20">
                        <h3 className="text-xl font-bold mb-1">Hi, {userName}! 👋</h3>
                        <p className="text-sm opacity-90 mb-2">{getToday()}</p>
                        <p className="text-sm font-semibold italic opacity-90">
                            STAY STRONG! YOU CAN ACHIEVE ANYTHING YOU SET YOUR MIND TO
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button className="text-white opacity-70 hover:opacity-100">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex items-center justify-between">
                    {/* Circular Chart */}
                    <div className="relative flex items-center justify-center">
                        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                stroke="rgba(255,255,255,0.2)"
                                fill="transparent"
                                strokeWidth={stroke}
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                            />
                            {/* Progress circle - Yellow */}
                            <circle
                                stroke="#fbbf24"
                                fill="transparent"
                                strokeWidth={stroke}
                                strokeDasharray={circumference + ' ' + circumference}
                                style={{ strokeDashoffset }}
                                strokeLinecap="round"
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                            />
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-4xl font-bold">{percentage}%</div>
                            <div className="text-sm opacity-80">Progress</div>
                        </div>
                    </div>

                    {/* Running Task Info */}
                    <div className="text-right">
                        <div className="text-sm opacity-80 mb-1">{labelRunning}</div>
                        <div className="text-4xl font-bold mb-2">{pending}</div>
                        {/* Additional metrics */}
                        {activePrinciples !== undefined && (
                            <div className="text-xs opacity-70 mb-1">
                                <span className="font-semibold">{activePrinciples}</span> Principles
                            </div>
                        )}
                        {activeSupervisors !== undefined && (
                            <div className="text-xs opacity-70">
                                <span className="font-semibold">{activeSupervisors}</span> Supervisors
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Info */}
                <div className="mt-6 space-y-3">
                    {/* Project Completed */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="opacity-90">{labelCompleted}</span>
                            <span className="font-bold">{completed} of {total}</span>
                        </div>
                        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                            <div
                                className="bg-white h-2 rounded-full transition-all duration-300"
                                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Project Hold */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="opacity-90">{labelPending}</span>
                            <span className="font-bold">{pending} of {total}</span>
                        </div>
                        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                            <div
                                className="bg-white bg-opacity-60 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${total > 0 ? (pending / total) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
