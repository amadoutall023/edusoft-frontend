'use client';

import React from 'react';
import { Bell, AlertTriangle, Calendar, FileCheck } from 'lucide-react';

interface AlertesACProps {
    alertes: string[];
}

export default function AlertesAC({ alertes }: AlertesACProps) {
    const getAlertIcon = (index: number) => {
        switch (index) {
            case 0:
                return <AlertTriangle className="w-4 h-4" color="#F59E0B" />;
            case 1:
                return <Calendar className="w-4 h-4" color="#5B8DEF" />;
            case 2:
                return <FileCheck className="w-4 h-4" color="#10B981" />;
            default:
                return <Bell className="w-4 h-4" color="#64748B" />;
        }
    };

    const getAlertColor = (index: number) => {
        switch (index) {
            case 0:
                return 'bg-amber-50 border-amber-200';
            case 1:
                return 'bg-blue-50 border-blue-200';
            case 2:
                return 'bg-green-50 border-green-200';
            default:
                return 'bg-slate-50 border-slate-200';
        }
    };

    return (
        <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                <Bell className="w-5 h-5 md:w-6 md:h-6" color="#EF4444" strokeWidth={2.5} />
                <h3 className="text-xl font-bold text-[#1a202c] m-0">
                    Alertes
                </h3>
            </div>

            {/* Alerts list */}
            <div className="flex flex-col gap-3">
                {alertes.map((alerte, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-xl border transition-all duration-300 ${getAlertColor(index)}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                {getAlertIcon(index)}
                            </div>
                            <p className="text-sm text-slate-700 m-0 leading-relaxed">
                                {alerte}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* View all link */}
            <div className="mt-4 text-center">
                <button className="text-sm font-medium text-[#5B8DEF] hover:text-[#4169B8] transition-colors">
                    Voir toutes les alertes →
                </button>
            </div>
        </div>
    );
}
