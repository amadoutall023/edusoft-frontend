'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchSessionById } from '@/modules/planning/services/sessionService';
import { SessionResponseDto } from '@/shared/api/types';
import EmargementPanel from '@/modules/cours/components/EmargementPanel';

export default function EmargementPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.sessionId as string;

    const [session, setSession] = useState<SessionResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSession = async () => {
            if (!sessionId) return;

            try {
                setLoading(true);
                const sessionData = await fetchSessionById(sessionId);
                setSession(sessionData);
            } catch (err) {
                console.error('Erreur chargement session:', err);
                setError('Impossible de charger la session');
            } finally {
                setLoading(false);
            }
        };

        loadSession();
    }, [sessionId]);

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #e2e8f0',
                    borderTopColor: '#2563eb',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }}></div>
                <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                <h2 style={{ color: '#dc2626', marginBottom: '8px' }}>Erreur</h2>
                <p style={{ color: '#64748b', marginBottom: '16px' }}>{error || 'Session non trouvée'}</p>
                <button
                    onClick={handleBack}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    ← Retour
                </button>
            </div>
        );
    }

    // Extraire le professorId de la session
    const professorId = session.professor?.id || '';
    const sessionDate = session.date;
    const sessionHeureDebut = session.startHour;

    return (
        <div style={{ padding: '16px' }}>
            {/* En-tête avec bouton retour */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                gap: '12px'
            }}>
                <button
                    onClick={handleBack}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#475569'
                    }}
                >
                    ← Retour
                </button>
                <div>
                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: 0
                    }}>
                        Émargement - {session.libelle || session.codeSession}
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: '4px 0 0 0'
                    }}>
                        {sessionDate} • {sessionHeureDebut} • {session.typeSession}
                    </p>
                </div>
            </div>

            {/* Panneau d'émargement */}
            <EmargementPanel
                sessionId={sessionId}
                professorId={professorId}
                sessionDate={sessionDate}
                sessionHeureDebut={sessionHeureDebut}
                onClose={handleBack}
            />
        </div>
    );
}
