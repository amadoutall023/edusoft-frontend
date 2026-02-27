'use client';

import React from 'react';
import { Calendar, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import { StatistiqueEvaluation } from '../types';

interface StatCardProps {
    stat: StatistiqueEvaluation;
}

const couleurClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    gray: 'bg-slate-50 border-slate-200 hover:bg-slate-100',
    green: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    red: 'bg-red-50 border-red-200 hover:bg-red-100',
};

const texteCouleurs = {
    blue: 'text-blue-600',
    gray: 'text-slate-600',
    green: 'text-emerald-600',
    red: 'text-red-600',
};

const iconCouleurs = {
    blue: 'text-blue-500',
    gray: 'text-slate-500',
    green: 'text-emerald-500',
    red: 'text-red-500',
};

export default function StatCard({ stat }: StatCardProps) {
    const bgClass = couleurClasses[stat.couleur as keyof typeof couleurClasses];
    const textClass = texteCouleurs[stat.couleur as keyof typeof texteCouleurs];
    const iconClass = iconCouleurs[stat.couleur as keyof typeof iconCouleurs];

    const renderIcon = () => {
        const iconProps = { className: `text-5xl ${iconClass}` };
        switch (stat.icon) {
            case 'calendar':
                return <Calendar {...iconProps} />;
            case 'clipboard':
                return <ClipboardList {...iconProps} />;
            case 'check':
                return <CheckCircle {...iconProps} />;
            case 'x':
                return <XCircle {...iconProps} />;
            default:
                return <Calendar {...iconProps} />;
        }
    };

    return (
        <div className={`
      ${bgClass}
      border-2 rounded-2xl p-6 cursor-pointer
      transition-all duration-300 hover:shadow-lg hover:scale-105
    `}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-medium text-slate-600 mb-2">
                        {stat.statut}
                    </div>
                    <div className={`text-4xl font-bold ${textClass}`}>
                        {stat.nombre}
                    </div>
                </div>
                <div>
                    {renderIcon()}
                </div>
            </div>
        </div>
    );
}
