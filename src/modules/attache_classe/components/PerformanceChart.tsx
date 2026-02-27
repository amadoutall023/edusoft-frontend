'use client';

import React from 'react';
import { ProgressionCours } from '@/modules/pedagogic/types';

interface PerformanceChartProps {
    data: ProgressionCours[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
    // Calculer les données de performance (taux de présence, moyenne des notes, etc.)
    const maxValue = Math.max(...data.map(d => d.termine + d.enCours), 1);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">
                    Performance scolaire
                </h3>
                <select className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Ce mois-ci</option>
                    <option>3 derniers mois</option>
                    <option>Cette année</option>
                </select>
            </div>

            {/* Graphique en courbe */}
            <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between gap-2">
                    {data.map((item, index) => {
                        const total = item.termine + item.enCours + item.enRetard;
                        const tauxCompletion = maxValue > 0 ? (item.termine / maxValue) * 100 : 0;
                        const tauxCours = maxValue > 0 ? ((item.termine + item.enCours) / maxValue) * 100 : 0;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="relative w-full flex items-end justify-center h-48 gap-1">
                                    {/* Barre de cours terminés */}
                                    <div
                                        className="w-4 sm:w-6 bg-emerald-500 rounded-t transition-all duration-300 hover:opacity-80"
                                        style={{ height: `${tauxCompletion}%` }}
                                        title={`Terminés: ${item.termine}`}
                                    />
                                    {/* Barre de cours en cours */}
                                    <div
                                        className="w-4 sm:w-6 bg-amber-500 rounded-t transition-all duration-300 hover:opacity-80"
                                        style={{ height: `${tauxCours - tauxCompletion}%` }}
                                        title={`En cours: ${item.enCours}`}
                                    />
                                </div>
                                <span className="text-xs text-slate-500 mt-2">{item.mois}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Légende */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-sm text-slate-600">Cours terminés</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span className="text-sm text-slate-600">Cours en cours</span>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
                <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                        {data.reduce((acc, d) => acc + d.termine, 0)}
                    </p>
                    <p className="text-xs text-slate-500">Terminés</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">
                        {data.reduce((acc, d) => acc + d.enCours, 0)}
                    </p>
                    <p className="text-xs text-slate-500">En cours</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">
                        {data.reduce((acc, d) => acc + d.enRetard, 0)}
                    </p>
                    <p className="text-xs text-slate-500">En retard</p>
                </div>
            </div>
        </div>
    );
}
