'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
    Calendar, 
    CheckCircle, 
    XCircle, 
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { AnneeScolaire } from '../types/anneeScolaire';
import { 
    fetchAnneeScolaire, 
    activateAnneeScolaire, 
    deactivateAnneeScolaire 
} from '../services/anneeScolaireService';
import { ApiError } from '@/shared/errors/ApiError';
import { useActiveYear } from '@/shared/context/ActiveYearContext';

interface AnneeScolaireAttacheProps {
    onYearChanged?: () => void;
}

export default function AnneeScolaireAttache({ onYearChanged }: AnneeScolaireAttacheProps) {
    const [annees, setAnnees] = useState<AnneeScolaire[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { refresh: refreshActiveYear } = useActiveYear();

    const loadAnnees = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchAnneeScolaire();
            setAnnees(data);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Impossible de charger les annees scolaires');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAnnees();
    }, [loadAnnees]);

    const handleActivate = async (id: string) => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccess(null);
            await activateAnneeScolaire(id);
            setSuccess('Annee scolaire activee avec succes');
            await loadAnnees();
            await refreshActiveYear();
            onYearChanged?.();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Impossible d\'activer l\'annee scolaire');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeactivate = async (id: string) => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccess(null);
            await deactivateAnneeScolaire(id);
            setSuccess('Annee scolaire desactivee avec succes');
            await loadAnnees();
            await refreshActiveYear();
            onYearChanged?.();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Impossible de desactiver l\'annee scolaire');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Trier les annees par date de debut (plus recent en premier)
    const sortedAnnees = [...annees].sort((a, b) => 
        new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
    );

    return (
        <div className="annee-scolaire-attache">
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#1a202c',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Calendar size={24} />
                        Annee Scolaire
                    </h2>
                    <p style={{ 
                        marginTop: '4px', 
                        color: '#64748b', 
                        fontSize: '14px' 
                    }}>
                        Selectionnez l'annee scolaire active
                    </p>
                </div>
                <button
                    onClick={() => loadAnnees()}
                    disabled={isLoading || isSaving}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: 'white',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: isLoading || isSaving ? 'not-allowed' : 'pointer',
                        opacity: isLoading || isSaving ? 0.7 : 1
                    }}
                >
                    <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                    Actualiser
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    padding: '12px 16px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    color: '#16a34a',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#64748b' 
                }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '12px' }}>Chargement des annees scolaires...</p>
                </div>
            )}

            {/* Cards */}
            {!isLoading && sortedAnnees.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '16px'
                }}>
                    {sortedAnnees.map((annee) => (
                        <div key={annee.id} style={{
                            background: 'white',
                            borderRadius: '12px',
                            border: annee.isCurrent ? '2px solid #16a34a' : '1px solid #e2e8f0',
                            padding: '20px',
                            transition: 'all 0.2s',
                            boxShadow: annee.isCurrent ? '0 4px 12px rgba(22, 163, 74, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '16px'
                            }}>
                                <div>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#1e293b',
                                        margin: 0
                                    }}>
                                        {annee.annee}
                                    </h3>
                                    {annee.description && (
                                        <p style={{
                                            fontSize: '13px',
                                            color: '#64748b',
                                            marginTop: '4px'
                                        }}>
                                            {annee.description}
                                        </p>
                                    )}
                                </div>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    background: annee.isCurrent ? '#dcfce7' : '#f1f5f9',
                                    color: annee.isCurrent ? '#16a34a' : '#64748b'
                                }}>
                                    {annee.isCurrent ? (
                                        <>
                                            <CheckCircle size={12} />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={12} />
                                            Inactive
                                        </>
                                    )}
                                </span>
                            </div>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                marginBottom: '16px',
                                padding: '12px',
                                background: '#f8fafc',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <span style={{
                                        fontSize: '11px',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Debut
                                    </span>
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#334155',
                                        margin: '2px 0 0'
                                    }}>
                                        {formatDate(annee.dateDebut)}
                                    </p>
                                </div>
                                <div>
                                    <span style={{
                                        fontSize: '11px',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Fin
                                    </span>
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#334155',
                                        margin: '2px 0 0'
                                    }}>
                                        {formatDate(annee.dateFin)}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => annee.isCurrent ? handleDeactivate(annee.id) : handleActivate(annee.id)}
                                disabled={isSaving}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                    background: annee.isCurrent ? '#fef3c7' : '#dcfce7',
                                    color: annee.isCurrent ? '#d97706' : '#16a34a',
                                    border: 'none'
                                }}
                            >
                                {isSaving ? (
                                    <RefreshCw size={16} className="spin" />
                                ) : annee.actif ? (
                                    <>
                                        <XCircle size={16} />
                                        Desactiver
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        Activer
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && sortedAnnees.length === 0 && (
                <div style={{
                    padding: '60px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px dashed #e2e8f0'
                }}>
                    <Calendar size={48} style={{ color: '#cbd5e1', margin: '0 auto' }} />
                    <h3 style={{
                        marginTop: '16px',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#475569'
                    }}>
                        Aucune annee scolaire
                    </h3>
                    <p style={{
                        marginTop: '8px',
                        color: '#94a3b8',
                        fontSize: '14px'
                    }}>
                        Veuillez contacter l'administrateur pour creer une annee scolaire
                    </p>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
