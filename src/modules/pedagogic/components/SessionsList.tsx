'use client';

import React from 'react';
import { Calendar, BookOpen, User } from 'lucide-react';
import { SessionAVenir } from '../types';

interface SessionsListProps {
    sessions: SessionAVenir[];
}

export default function SessionsList({ sessions }: SessionsListProps) {
    return (
        <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                <Calendar className="w-5 h-5 md:w-6 md:h-6" color="#5B8DEF" strokeWidth={2.5} />
                <h3 className="text-xl font-bold text-[#1a202c] m-0">
                    Session à venir
                </h3>
            </div>

            {/* Sessions list */}
            <div className="flex flex-col gap-4">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 transition-all duration-300 cursor-pointer hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] relative overflow-hidden"
                    >
                        {/* Color indicator */}
                        <div
                            className="absolute left-0 top-0 bottom-0 w-[5px]"
                            style={{ backgroundColor: session.couleur }}
                        />

                        {/* Icon */}
                        <div
                            className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3"
                            style={{ backgroundColor: session.couleur }}
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
                            {session.dateLabel && (
                                <span className="block text-xs text-slate-400 mt-1">{session.dateLabel}</span>
                            )}
                        </div>

                        {/* Professor */}
                        <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                            <User className="w-3 h-3" />
                            {session.professeur}
                        </div>

                        {session.heureLabel && (
                            <div className="mt-2 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                <ClockIcon />
                                {session.heureLabel}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ClockIcon() {
    return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    );
}
