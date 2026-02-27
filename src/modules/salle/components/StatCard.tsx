'use client';

import React from 'react';
import { MapPin, Check, X, Building } from 'lucide-react';
import { StatistiqueSalle } from './types';

interface StatCardProps {
    stat: StatistiqueSalle;
}

const couleurClasses = {
    blue: 'bg-gradient-to-br from-blue-400 to-blue-500',
    green: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
    red: 'bg-gradient-to-br from-red-400 to-red-500',
};

export default function StatCard({ stat }: StatCardProps) {
    const bgClass = couleurClasses[stat.couleur as keyof typeof couleurClasses];

    const renderIcon = () => {
        const iconProps = { className: "text-6xl opacity-80" };
        switch (stat.icon) {
            case 'map':
                return <MapPin {...iconProps} />;
            case 'check':
                return <Check {...iconProps} />;
            case 'x':
                return <X {...iconProps} />;
            default:
                return <Building {...iconProps} />;
        }
    };

    return (
        <div className={`
      ${bgClass}
      text-white rounded-2xl p-6 shadow-lg
      transition-all duration-300 hover:shadow-2xl hover:scale-105
    `}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-medium opacity-90 mb-2">
                        {stat.label}
                    </div>
                    <div className="text-5xl font-bold">
                        {stat.nombre}
                    </div>
                </div>
                <div className="text-6xl opacity-80">
                    {renderIcon()}
                </div>
            </div>
        </div>
    );
}
