'use client';

import React, { useState, useMemo } from 'react';

interface PresenceData {
    present: number;
    absent: number;
    total: number;
}

interface PresenceCardProps {
    data: PresenceData;
    title?: string;
}

export default function PresenceCard({ data, title = "Présences aujourd'hui" }: PresenceCardProps) {
    const [classeFilter, setClasseFilter] = useState<string>('toutes');

    const percentages = useMemo(() => {
        if (data.total === 0) {
            return { present: 0, absent: 0 };
        }
        return {
            present: Math.round((data.present / data.total) * 100),
            absent: Math.round((data.absent / data.total) * 100)
        };
    }, [data]);

    // Calcul du graphique circulaire (donut)
    const circumference = 2 * Math.PI * 45; // radius = 45
    const presentDash = (percentages.present / 100) * circumference;
    const absentDash = (percentages.absent / 100) * circumference;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">
                    {title}
                </h3>

                {/* Filtre par classe */}
                <select
                    value={classeFilter}
                    onChange={(e) => setClasseFilter(e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="toutes">Toutes les classes</option>
                    <option value="classe1">Classe 1</option>
                    <option value="classe2">Classe 2</option>
                </select>
            </div>

            {/* Graphique circulaire (donut) */}
            <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Cercle de fond */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="10"
                        />
                        {/* Présences (vert) */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="10"
                            strokeDasharray={`${presentDash} ${circumference}`}
                            strokeLinecap="round"
                        />
                        {/* Absences (jaune) */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="10"
                            strokeDasharray={`${absentDash} ${circumference}`}
                            strokeDashoffset={-presentDash}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Centre du donut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-slate-800">
                            {data.total}
                        </span>
                        <span className="text-xs text-slate-500">élèves</span>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{data.present}</p>
                    <p className="text-xs text-emerald-700">Présents</p>
                    <p className="text-xs text-emerald-500">{percentages.present}%</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{data.absent}</p>
                    <p className="text-xs text-amber-700">Absents</p>
                    <p className="text-xs text-amber-500">{percentages.absent}%</p>
                </div>
            </div>

            {/* Légende */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full" />
                    <span className="text-sm text-slate-600">Présent</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-500 rounded-full" />
                    <span className="text-sm text-slate-600">Absent</span>
                </div>
            </div>
        </div>
    );
}
