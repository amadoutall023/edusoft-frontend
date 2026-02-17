'use client';

import React, { useState } from 'react';
import { User, Play, Archive, Pencil, Trash2, X, Eye, Clock, Calendar, Search, Check } from 'lucide-react';
import { Cours } from '../types';

interface SessionData {
    codeSession: string;
    date: string;
    heureDebut: string;
    heureFin: string;
    type: 'en_ligne' | 'presentiel';
}

interface Session {
    id: number;
    codeSession: string;
    date: string;
    heureDebut: string;
    heureFin: string;
    type: 'en_ligne' | 'presentiel';
    isTerminee: boolean;
}

interface CoursCardProps {
    cours: Cours;
    onArchive?: (id: number) => void;
    isArchiveView?: boolean;
}

export default function CoursCard({ cours, onArchive, isArchiveView }: CoursCardProps) {
    const [showModal, setShowModal] = useState(false);
    const [showSessionsModal, setShowSessionsModal] = useState(false);
    const [sessionSearchTerm, setSessionSearchTerm] = useState('');
    const [newSession, setNewSession] = useState<SessionData>({
        codeSession: '',
        date: '',
        heureDebut: '',
        heureFin: '',
        type: 'presentiel'
    });

    const handleArchive = () => {
        if (onArchive && cours.id) {
            onArchive(cours.id);
        }
    };

    // Sample sessions data for demonstration
    const [sessions, setSessions] = useState<Session[]>([
        { id: 1, codeSession: 'SES-001', date: '2024-01-15', heureDebut: '08:00', heureFin: '10:00', type: 'presentiel', isTerminee: true },
        { id: 2, codeSession: 'SES-002', date: '2024-01-22', heureDebut: '08:00', heureFin: '10:00', type: 'presentiel', isTerminee: true },
        { id: 3, codeSession: 'SES-003', date: '2024-01-29', heureDebut: '14:00', heureFin: '16:00', type: 'en_ligne', isTerminee: false },
    ]);

    const filteredSessions = sessions.filter(session =>
        session.codeSession.toLowerCase().includes(sessionSearchTerm.toLowerCase()) ||
        session.date.includes(sessionSearchTerm)
    );

    const handleDeleteSession = (id: number) => {
        setSessions(sessions.filter(s => s.id !== id));
    };

    const handleMarkAsTerminee = (id: number) => {
        setSessions(sessions.map(s =>
            s.id === id ? { ...s, isTerminee: true } : s
        ));
    };
    const getProgressColor = (progression: number) => {
        if (progression >= 80) return '#10b981';
        if (progression >= 60) return '#fbbf24';
        if (progression >= 40) return '#fb923c';
        return '#ef4444';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Nouvelle session:', { cours: cours.titre, ...newSession });
        setShowModal(false);
        setNewSession({
            codeSession: '',
            date: '',
            heureDebut: '',
            heureFin: '',
            type: 'presentiel'
        });
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

                <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                        title="Voir les sessions"
                        onClick={() => setShowSessionsModal(true)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#E8F5E9',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e: any) => {
                            e.currentTarget.style.background = '#4CAF50';
                            e.currentTarget.querySelector('svg').style.color = 'white';
                        }}
                        onMouseLeave={(e: any) => {
                            e.currentTarget.style.background = '#E8F5E9';
                            e.currentTarget.querySelector('svg').style.color = '#4CAF50';
                        }}
                    >
                        <Eye size={16} color="#4CAF50" strokeWidth={2.5} />
                    </button>
                    <button
                        title="Créer session du cours"
                        onClick={() => setShowModal(true)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#E3F2FD',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e: any) => {
                            e.currentTarget.style.background = '#5B8DEF';
                            e.currentTarget.querySelector('svg').style.color = 'white';
                        }}
                        onMouseLeave={(e: any) => {
                            e.currentTarget.style.background = '#E3F2FD';
                            e.currentTarget.querySelector('svg').style.color = '#5B8DEF';
                        }}
                    >
                        <Play size={16} color="#5B8DEF" strokeWidth={2.5} />
                    </button>
                    <button
                        title={isArchiveView ? "Désarchiver" : "Archiver"}
                        onClick={handleArchive}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isArchiveView ? '#E8F5E9' : '#FFF3E0',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e: any) => {
                            e.currentTarget.style.background = isArchiveView ? '#4CAF50' : '#FF9800';
                            e.currentTarget.querySelector('svg').style.color = 'white';
                        }}
                        onMouseLeave={(e: any) => {
                            e.currentTarget.style.background = isArchiveView ? '#E8F5E9' : '#FFF3E0';
                            e.currentTarget.querySelector('svg').style.color = isArchiveView ? '#4CAF50' : '#FF9800';
                        }}
                    >
                        {isArchiveView ? (
                            <Check size={16} color="#4CAF50" strokeWidth={2.5} />
                        ) : (
                            <Archive size={16} color="#FF9800" strokeWidth={2.5} />
                        )}
                    </button>
                    <button
                        title="Modifier"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#E8F5E9',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e: any) => {
                            e.currentTarget.style.background = '#4CAF50';
                            e.currentTarget.querySelector('svg').style.color = 'white';
                        }}
                        onMouseLeave={(e: any) => {
                            e.currentTarget.style.background = '#E8F5E9';
                            e.currentTarget.querySelector('svg').style.color = '#4CAF50';
                        }}
                    >
                        <Pencil size={16} color="#4CAF50" strokeWidth={2.5} />
                    </button>
                    <button
                        title="Supprimer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#FFEBEE',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e: any) => {
                            e.currentTarget.style.background = '#F44336';
                            e.currentTarget.querySelector('svg').style.color = 'white';
                        }}
                        onMouseLeave={(e: any) => {
                            e.currentTarget.style.background = '#FFEBEE';
                            e.currentTarget.querySelector('svg').style.color = '#F44336';
                        }}
                    >
                        <Trash2 size={16} color="#F44336" strokeWidth={2.5} />
                    </button>
                </div>
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

            {/* Modal for creating session */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}
                    onClick={() => setShowModal(false)}
                >
                    <div className="modal-content" style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '450px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        animation: 'slideIn 0.3s ease'
                    }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#1a202c',
                                margin: 0
                            }}>Créer une session</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#f1f5f9',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={18} color="#64748b" />
                            </button>
                        </div>

                        <div style={{ marginBottom: '12px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Cours</div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>{cours.titre}</div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '6px'
                                }}>Code Session</label>
                                <input
                                    type="text"
                                    value={newSession.codeSession}
                                    onChange={(e) => setNewSession({ ...newSession, codeSession: e.target.value })}
                                    placeholder="Ex: SES-001"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                                    onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '6px'
                                }}>Date</label>
                                <input
                                    type="date"
                                    value={newSession.date}
                                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                                    onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#4a5568',
                                        marginBottom: '6px'
                                    }}>Heure début</label>
                                    <input
                                        type="time"
                                        value={newSession.heureDebut}
                                        onChange={(e) => setNewSession({ ...newSession, heureDebut: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1.5px solid #e2e8f0',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease',
                                            fontFamily: 'inherit'
                                        }}
                                        onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                                        onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#4a5568',
                                        marginBottom: '6px'
                                    }}>Heure fin</label>
                                    <input
                                        type="time"
                                        value={newSession.heureFin}
                                        onChange={(e) => setNewSession({ ...newSession, heureFin: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1.5px solid #e2e8f0',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease',
                                            fontFamily: 'inherit'
                                        }}
                                        onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                                        onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '6px'
                                }}>Type de session</label>
                                <select
                                    value={newSession.type}
                                    onChange={(e) => setNewSession({ ...newSession, type: e.target.value as 'en_ligne' | 'presentiel' })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        fontFamily: 'inherit',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}
                                    onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                                    onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                                >
                                    <option value="presentiel">Présentiel</option>
                                    <option value="en_ligne">En ligne</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: '8px',
                                        border: '1.5px solid #e2e8f0',
                                        background: 'white',
                                        color: '#64748b',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                        color: 'white',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 12px rgba(91,141,239,0.3)'
                                    }}
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for viewing sessions list */}
            {showSessionsModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}
                    onClick={() => setShowSessionsModal(false)}
                >
                    <div className="modal-content" style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '550px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        animation: 'slideIn 0.3s ease'
                    }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#1a202c',
                                    margin: 0
                                }}>Sessions du cours</h3>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>{cours.titre}</p>
                            </div>
                            <button
                                onClick={() => setShowSessionsModal(false)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#f1f5f9',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={18} color="#64748b" />
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <div style={{
                                padding: '6px 12px',
                                background: '#f8fafc',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#64748b'
                            }}>
                                <strong>{filteredSessions.length}</strong> sessions
                            </div>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={sessionSearchTerm}
                                    onChange={(e) => setSessionSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '6px 10px 6px 32px',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '12px',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredSessions.map((session) => (
                                <div key={session.id} style={{
                                    padding: '14px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    background: session.isTerminee ? '#f0fdf4' : 'white',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {session.codeSession}
                                                {session.isTerminee && (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '10px',
                                                        fontWeight: '500',
                                                        background: '#10b981',
                                                        color: 'white'
                                                    }}>
                                                        <Check size={10} style={{ marginRight: '2px' }} /> Terminé
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{
                                                display: 'inline-flex',
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                                marginTop: '4px',
                                                background: session.type === 'presentiel' ? '#E3F2FD' : '#FFF3E0',
                                                color: session.type === 'presentiel' ? '#5B8DEF' : '#FF9800'
                                            }}>
                                                {session.type === 'presentiel' ? 'Présentiel' : 'En ligne'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {!session.isTerminee && (
                                                <button
                                                    onClick={() => handleMarkAsTerminee(session.id)}
                                                    title="Marquer comme terminé"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '4px',
                                                        padding: '6px 10px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        background: '#10b981',
                                                        color: 'white',
                                                        fontSize: '11px',
                                                        fontWeight: '500',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e: any) => {
                                                        e.currentTarget.style.background = '#059669';
                                                    }}
                                                    onMouseLeave={(e: any) => {
                                                        e.currentTarget.style.background = '#10b981';
                                                    }}
                                                >
                                                    <Check size={12} /> Terminer
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteSession(session.id)}
                                                title="Supprimer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: '#FFEBEE',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e: any) => {
                                                    e.currentTarget.style.background = '#F44336';
                                                    e.currentTarget.querySelector('svg').style.color = 'white';
                                                }}
                                                onMouseLeave={(e: any) => {
                                                    e.currentTarget.style.background = '#FFEBEE';
                                                    e.currentTarget.querySelector('svg').style.color = '#F44336';
                                                }}
                                            >
                                                <Trash2 size={14} color="#F44336" strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} />
                                            <span>{session.date}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} />
                                            <span>{session.heureDebut} - {session.heureFin}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {sessions.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                                <div style={{ fontSize: '14px', fontWeight: '500' }}>Aucune session</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

