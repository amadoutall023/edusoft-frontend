'use client';

import React from 'react';
import { User } from 'lucide-react';
import { Cours } from '../types';

interface CoursCardProps {
    cours: Cours;
}

export default function CoursCard({ cours }: CoursCardProps) {
    const getProgressColor = (progression: number) => {
        if (progression >= 80) return '#10b981';
        if (progression >= 60) return '#fbbf24';
        if (progression >= 40) return '#fb923c';
        return '#ef4444';
    };

    const progressColor = getProgressColor(cours.progression);

    return (
        <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
            transition: 'all 0.2s ease'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '10px'
            }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1a202c',
                        marginBottom: '4px',
                        lineHeight: '1.3'
                    }}>{cours.titre}</h3>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{cours.niveau}</div>
                </div>

                <button style={{
                    padding: '6px 10px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: '#475569',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit'
                }}>
                    Voir
                </button>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
                paddingBottom: '10px',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <User size={14} color="#64748b" />
                <span style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{cours.professeur}</span>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                marginBottom: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                    <div>
                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>Volume horaire</div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#10b981' }}>{cours.volumeHoraire}h</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }} />
                    <div>
                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>Heures planifié</div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#fbbf24' }}>{cours.heuresPlanifie}h</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                    <div>
                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>Heures faites</div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#3b82f6' }}>{cours.heuresFaites}h</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                    <div>
                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>Heures restantes</div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444' }}>{cours.heuresRestantes}h</div>
                    </div>
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>Progression</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#1a202c' }}>{cours.progression}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${cours.progression}%`, height: '100%', background: progressColor, borderRadius: '3px' }} />
                </div>
            </div>
        </div>
    );
}

