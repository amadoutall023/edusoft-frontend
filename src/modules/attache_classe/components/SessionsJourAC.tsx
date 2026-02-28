'use client';

import React from 'react';
import { Calendar, BookOpen, User, MapPin } from 'lucide-react';
import { SessionCoursAC } from '../types';

interface SessionsJourACProps {
    sessions: SessionCoursAC[];
}

function ClockIcon() {
    return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    );
}

function getStatutColor(statut: SessionCoursAC['statut']): string {
    switch (statut) {
        case 'termine':
            return '#10B981';
        case 'en_cours':
            return '#5B8DEF';
        case 'planifie':
            return '#F59E0B';
        case 'annule':
            return '#EF4444';
        default:
            return '#64748B';
    }
}

function getStatutLabel(statut: SessionCoursAC['statut']): string {
    switch (statut) {
        case 'termine':
            return 'Terminé';
        case 'en_cours':
            return 'En cours';
        case 'planifie':
            return 'Planifié';
        case 'annule':
            return 'Annulé';
        default:
            return statut;
    }
}

export default function SessionsJourAC({ sessions }: SessionsJourACProps) {
    return (
        <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                <Calendar className="w-5 h-5 md:w-6 md:h-6" color="#5B8DEF" strokeWidth={2.5} />
                <h3 className="text-xl font-bold text-[#1a202c] m-0">
                    Cours du jour
                </h3>
            </div>

            {/* Sessions list */}
            <div className="flex flex-col gap-4">
                {sessions.map((session) => {
                    const couleur = getStatutColor(session.statut);
                    return (
                        <div
                            key={session.id}
                            className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 transition-all duration-300 cursor-pointer hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] relative overflow-hidden"
                        >
                            {/* Color indicator */}
                            <div
                                className="absolute left-0 top-0 bottom-0 w-[5px]"
                                style={{ backgroundColor: couleur }}
                            />

                            {/* Icon */}
                            <div
                                className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3"
                                style={{ backgroundColor: couleur }}
                            >
                                <BookOpen className="w-5 h-5" color="white" strokeWidth={2} />
                            </div>

                            {/* Course name */}
                            <div className="text-base font-bold text-[#1a202c] mb-2">
                                {session.cours}
                            </div>

                            {/* Level */}
                            <div className="text-sm font-medium text-slate-500 mb-2">
                                {session.niveau}
                            </div>

                            {/* Professor */}
                            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                                <User className="w-3 h-3" />
                                {session.professeur}
                            </div>

                            {/* Salle */}
                            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-2">
                                <MapPin className="w-3 h-3" />
                                {session.salle}
                            </div>

                            {/* Heure */}
                            <div className="mt-2 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                <ClockIcon />
                                {session.heure}
                            </div>

                            {/* Statut badge */}
                            <div
                                className="mt-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: couleur }}
                            >
                                {getStatutLabel(session.statut)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
