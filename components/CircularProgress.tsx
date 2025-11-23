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
    labelRunning = 'Running Task'
}) => {
    const radius = 60;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
                {/* Title */}
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
                            {/* Progress circle */}
                            <circle
                                stroke="white"
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
                            <div className="text-3xl font-bold">{percentage}%</div>
                            <div className="text-xs opacity-80">Progress</div>
                        </div>
                    </div>

                    {/* Running Task Info */}
                    <div className="text-right">
                        <div className="text-sm opacity-80 mb-1">{labelRunning}</div>
                        <div className="text-4xl font-bold">{pending}</div>
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
