'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { MenuAction } from '../types';
import { useRouter } from 'next/navigation';

interface MenuActionCardProps {
    action: MenuAction;
}

const couleurClasses = {
    blue: { bg: 'bg-[#5B8DEF]/10', text: 'text-[#5B8DEF]', hover: 'hover:border-[#5B8DEF]' },
    yellow: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', hover: 'hover:border-[#f59e0b]' },
    green: { bg: 'bg-[#10b981]/10', text: 'text-[#10b981]', hover: 'hover:border-[#10b981]' },
    red: { bg: 'bg-red-100', text: 'text-red-600', hover: 'hover:border-red-500' },
    purple: { bg: 'bg-[#8b5cf6]/10', text: 'text-[#8b5cf6]', hover: 'hover:border-[#8b5cf6]' },
};

export default function MenuActionCard({ action }: MenuActionCardProps) {
    const router = useRouter();
    const colors = couleurClasses[action.couleur as keyof typeof couleurClasses] || couleurClasses.blue;

    const handleClick = () => {
        router.push(action.route);
    };

    const IconComponent = action.icon;

    return (
        <div
            onClick={handleClick}
            className={`bg-white rounded-xl md:rounded-[20px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] 
                  border border-slate-100 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] 
                  transition-all duration-300 cursor-pointer hover:-translate-y-1
                  ${colors.hover}`}
        >
            <div className="flex items-center justify-between">
                {/* Icône */}
                <div className={`${colors.bg} w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center 
                       justify-center shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${colors.text}`} />
                </div>

                {/* Texte */}
                <div className="flex-1 mx-4">
                    <div className="text-base md:text-lg font-bold text-slate-900 mb-1">
                        {action.titre}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                        {action.sousTitre}
                    </div>
                </div>

                {/* Chevron */}
                <ChevronRight size={22} className="text-slate-400 shrink-0" />
            </div>
        </div>
    );
}
