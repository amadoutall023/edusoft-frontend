'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ProgressionCours } from '../types';

interface ProgressionChartProps {
    data: ProgressionCours[];
}

// SVG-based line chart component
export default function ProgressionChart({ data }: ProgressionChartProps) {
    const width = 800;
    const height = 300;
    const padding = { top: 30, right: 30, bottom: 50, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = 50; // Fixed max for better visualization

    // Calculate points for each line
    const getPoints = (key: keyof Omit<ProgressionCours, 'mois'>) => {
        return data.map((item, index) => {
            const x = padding.left + (index / (data.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - (item[key] / maxValue) * chartHeight;
            return { x, y };
        });
    };

    const enRetardPoints = getPoints('enRetard');
    const attentionPoints = getPoints('attention');
    const enCoursPoints = getPoints('enCours');
    const terminePoints = getPoints('termine');

    // Generate SVG path for smooth curves
    const generatePath = (points: { x: number; y: number }[]) => {
        if (points.length === 0) return '';

        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx = (prev.x + curr.x) / 2;
            path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
        }

        return path;
    };

    // Generate area path for fill
    const generateAreaPath = (points: { x: number; y: number }[], color: string) => {
        if (points.length === 0) return '';

        let path = `M ${points[0].x} ${padding.top + chartHeight}`;
        path += ` L ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx = (prev.x + curr.x) / 2;
            path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
        }

        path += ` L ${points[points.length - 1].x} ${padding.top + chartHeight}`;
        path += ' Z';

        return path;
    };

    const lines = [
        {
            key: 'termine',
            points: terminePoints,
            color: '#10b981',
            label: 'Terminé',
            dashArray: '0'
        },
        {
            key: 'enCours',
            points: enCoursPoints,
            color: '#3b82f6',
            label: 'En cours',
            dashArray: '0'
        },
        {
            key: 'attention',
            points: attentionPoints,
            color: '#f59e0b',
            label: 'Attention',
            dashArray: '0'
        },
        {
            key: 'enRetard',
            points: enRetardPoints,
            color: '#ef4444',
            label: 'En retard',
            dashArray: '0'
        },
    ];

    return (
        <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-[#1a202c] m-0 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 md:w-[20px] md:h-[20px]" />
                    Progression des cours
                </h3>
            </div>

            {/* Legend */}
            <div className="flex gap-4 md:gap-6 mb-4 md:mb-6 flex-wrap">
                {lines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div
                            className="w-5 md:w-6 h-[3px] md:h-1 rounded-full"
                            style={{ backgroundColor: line.color }}
                        />
                        <span className="text-xs md:text-sm font-medium text-slate-500">
                            {line.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* SVG Line Chart */}
            <div className="w-full overflow-hidden">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto block"
                >
                    {/* Grid lines */}
                    {[0, 10, 20, 30, 40, 50].map((value) => (
                        <g key={value}>
                            <line
                                x1={padding.left}
                                y1={padding.top + chartHeight - (value / maxValue) * chartHeight}
                                x2={width - padding.right}
                                y2={padding.top + chartHeight - (value / maxValue) * chartHeight}
                                stroke="#e2e8f0"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                            <text
                                x={padding.left - 10}
                                y={padding.top + chartHeight - (value / maxValue) * chartHeight + 4}
                                textAnchor="end"
                                fontSize="12"
                                fill="#94a3b8"
                            >
                                {value}
                            </text>
                        </g>
                    ))}

                    {/* X-axis labels (months) */}
                    {data.map((item, idx) => (
                        <text
                            key={idx}
                            x={padding.left + (idx / (data.length - 1)) * chartWidth}
                            y={height - 15}
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight="600"
                            fill="#64748b"
                        >
                            {item.mois}
                        </text>
                    ))}

                    {/* Area fills */}
                    {lines.map((line, idx) => (
                        <path
                            key={`area-${idx}`}
                            d={generateAreaPath(line.points, line.color)}
                            fill={line.color}
                            opacity={0.1}
                        />
                    ))}

                    {/* Lines */}
                    {lines.map((line, idx) => (
                        <path
                            key={`line-${idx}`}
                            d={generatePath(line.points)}
                            fill="none"
                            stroke={line.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}

                    {/* Data points */}
                    {lines.map((line, lineIdx) => (
                        line.points.map((point, pointIdx) => (
                            <g key={`point-${lineIdx}-${pointIdx}`}>
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="6"
                                    fill="white"
                                    stroke={line.color}
                                    strokeWidth="3"
                                />
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="3"
                                    fill={line.color}
                                />
                            </g>
                        ))
                    ))}
                </svg>
            </div>
        </div>
    );
}
