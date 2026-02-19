'use client';

import React from 'react';
import StatCard from './StatCard';
import ProgressionChart from './ProgressionChart';
import SessionsList from './SessionsList';
import AlertSession from './AlertSession';
import {
    statistiques,
    sessionsAVenir,
    progressionMensuelle,
    sessionAnnulee
} from '../data/dashboard';

export default function PedagogiqueContent() {
    return (
        <>
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-[32px] font-extrabold text-[#1a202c] mb-2">
                    Responsable Pédagogique
                </h1>
                <p className="text-sm md:text-[15px] text-slate-500">
                    Vue d'ensemble de votre établissement
                </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {statistiques.map((stat, idx) => (
                    <StatCard key={idx} stat={stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="xl:col-span-8">
                    <ProgressionChart data={progressionMensuelle} />
                </div>
                <div className="xl:col-span-4">
                    <SessionsList sessions={sessionsAVenir} />
                </div>
            </div>

            {/* Alert */}
            <div className="mb-4 md:mb-6">
                <AlertSession session={sessionAnnulee} />
            </div>
        </>
    );
}
