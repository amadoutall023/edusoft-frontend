'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { SessionAnnulee } from '../types';

interface AlertSessionProps {
    session: SessionAnnulee;
    onClose?: () => void;
}

export default function AlertSession({ session, onClose }: AlertSessionProps) {
    return (
        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl md:rounded-2xl p-5 md:p-6 border-2 border-red-300 relative shadow-[0_4px_12px_rgba(239,68,68,0.15)]">
            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-transparent border-none cursor-pointer p-1 rounded-md transition-all duration-200 hover:bg-red-200/50"
                >
                    <X className="w-4 h-4 md:w-[18px] md:h-[18px]" color="#dc2626" strokeWidth={2.5} />
                </button>
            )}

            <div className="flex gap-3 md:gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-600 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6" color="white" strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="flex-1 pr-4 md:pr-6">
                    <div className="text-sm md:text-base font-bold text-red-900 mb-2">
                        Session de management annulée {session.date}
                    </div>

                    <div className="text-xs md:text-sm font-medium text-red-800 mb-1">
                        {session.niveau} - {session.professeur}
                    </div>

                    <div className="text-xs text-red-600 leading-relaxed">
                        Cette session a été annulée. Les étudiants ont été notifiés.
                    </div>
                </div>
            </div>
        </div>
    );
}
