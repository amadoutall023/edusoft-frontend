'use client';

import React from 'react';
import { UserX, CheckCircle, XCircle, BookOpen, Calendar } from 'lucide-react';
import { AbsenceAC } from '../types';

interface AbsencesRecentesACProps {
    absences: AbsenceAC[];
}

export default function AbsencesRecentesAC({ absences }: AbsencesRecentesACProps) {
    return (
        <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                <UserX className="w-5 h-5 md:w-6 md:h-6" color="#F59E0B" strokeWidth={2.5} />
                <h3 className="text-xl font-bold text-[#1a202c] m-0">
                    Absences récentes
                </h3>
            </div>

            {/* Absences list */}
            <div className="flex flex-col gap-3">
                {absences.map((absence) => (
                    <div
                        key={absence.id}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                    <UserX className="w-4 h-4" color="#64748B" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-[#1a202c]">
                                        {absence.etudiant}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" />
                                        {absence.cours}
                                    </div>
                                </div>
                            </div>
                            {absence.justifiee ? (
                                <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    Justifiée
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                    <XCircle className="w-3 h-3" />
                                    Non justifiée
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {absence.date}
                        </div>
                    </div>
                ))}
            </div>

            {/* View all link */}
            <div className="mt-4 text-center">
                <button className="text-sm font-medium text-[#5B8DEF] hover:text-[#4169B8] transition-colors">
                    Voir toutes les absences →
                </button>
            </div>
        </div>
    );
}
