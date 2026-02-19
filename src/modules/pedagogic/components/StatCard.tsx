'use client';

import React from 'react';
import { BookOpen, GraduationCap, FolderKanban, UserCheck } from 'lucide-react';
import { StatistiqueDashboard } from '../types';

interface StatCardProps {
    stat: StatistiqueDashboard;
}

const iconMap: Record<string, React.ComponentType<any>> = {
    '📚': BookOpen,
    '🎓': GraduationCap,
    '📋': FolderKanban,
    '👨‍🏫': UserCheck,
};

export default function StatCard({ stat }: StatCardProps) {
    const IconComponent = iconMap[stat.icon] || BookOpen;

    return (
        <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
            <div
                className="absolute -top-5 -right-5 w-[80px] md:w-[100px] h-[80px] md:h-[100px] rounded-full blur-[20px]"
                style={{ backgroundColor: `${stat.couleur}15` }}
            />
            <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                    <div className="text-xs md:text-sm font-medium text-slate-500 mb-2 md:mb-3 tracking-wide">
                        {stat.titre}
                    </div>
                    <div
                        className="text-2xl md:text-[36px] font-extrabold leading-none"
                        style={{ color: stat.couleur, letterSpacing: '-1px' }}
                    >
                        {stat.valeur}
                    </div>
                </div>
                <div
                    className="w-10 h-10 md:w-16 md:h-16 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.couleur}15` }}
                >
                    <IconComponent className="w-5 h-5 md:w-8 md:h-8" color={stat.couleur} strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}
