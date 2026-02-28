'use client';

import React from 'react';
import { SeancePlanning } from '../types';

interface SeanceCardProps {
    seance: SeancePlanning;
}

const couleurClasses = {
    amber: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    pink: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    green: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    purple: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    red: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
};

export default function SeanceCard({ seance }: SeanceCardProps) {
    const couleurClass = seance.couleur.startsWith('linear')
        ? seance.couleur
        : couleurClasses[seance.couleur as keyof typeof couleurClasses] || couleurClasses.blue;

    return (
        <div
            className="seance-card"
            style={{
                background: couleurClass,
                borderRadius: '10px',
                padding: '10px 12px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
        >
            <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '4px' }}>{seance.classe}</div>
            <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>{seance.cours}</div>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '2px' }}>{seance.professeur}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{seance.salle}</div>

            <style jsx>{`
        .seance-card:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 16px rgba(0,0,0,0.25) !important;
        }
      `}</style>
        </div>
    );
}
