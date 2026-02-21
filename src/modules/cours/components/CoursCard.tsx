'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { User, Play, Archive, Pencil, Trash2, X, Eye, Clock, Calendar, Search, Check } from 'lucide-react';
import { Cours } from '../types';
import { fetchSessions } from '@/modules/planning/services/sessionService';
import { SessionResponseDto } from '@/shared/api/types';

interface SessionData {
    codeSession: string;
    date: string;
    heureDebut: string;
    heureFin: string;
    type: 'en_ligne' | 'presentiel';
}

interface CoursCardProps {
    cours: Cours;
    onArchive?: (id: string) => void;
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
    const [sessions, setSessions] = useState<SessionResponseDto[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [sessionsError, setSessionsError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setSessionsLoading(true);
                const { data } = await fetchSessions({ coursId: cours.id, size: 50 });
                setSessions(data ?? []);
                setSessionsError(null);
            } catch (err) {
                setSessionsError('Impossible de charger les sessions.');
            } finally {
                setSessionsLoading(false);
            }
        };

        if (showSessionsModal) {
            void load();
        }
    }, [cours.id, showSessionsModal]);

    const filteredSessions = useMemo(() => {
        return sessions.filter(session =>
            (session.codeSession ?? '').toLowerCase().includes(sessionSearchTerm.toLowerCase()) ||
            session.date.includes(sessionSearchTerm)
        );
    }, [sessions, sessionSearchTerm]);

    const handleArchive = () => {
        if (onArchive) {
            onArchive(cours.id);
        }
    };

    const getProgressColor = (progression: number) => {
        if (progression >= 80) return '#10b981';
        if (progression >= 60) return '#fbbf24';
        if (progression >= 40) return '#fb923c';
        return '#ef4444';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Nouvelle session (à implémenter):', { cours: cours.titre, ...newSession });
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
                        title={isArchiveView ? 'Désarchiver' : 'Archiver'}
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
                </div>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px'
            }}>
                <div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Volume horaire</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{cours.volumeHoraire} h</div>
                </div>
                <div style={{ width: '60%' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Progression</div>
                    <div style={{
                        height: '8px',
                        borderRadius: '999px',
                        background: '#e2e8f0',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${cours.progression}%`,
                            background: progressColor,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{cours.progression}% effectué</div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                fontSize: '12px'
            }}>
                <div>
                    <div style={{ color: '#94a3b8' }}>Planifié</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{cours.heuresPlanifie} h</div>
                </div>
                <div>
                    <div style={{ color: '#94a3b8' }}>Réalisé</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{cours.heuresFaites} h</div>
                </div>
                <div>
                    <div style={{ color: '#94a3b8' }}>Restant</div>
                    <div style={{ fontWeight: '600', color: cours.heuresRestantes === 0 ? '#10b981' : '#1e293b' }}>{cours.heuresRestantes} h</div>
                </div>
            </div>

            {/* Modals retain original structure */}
            {showModal && (
                <div className="modal-overlay" style={modalOverlayStyle} onClick={() => setShowModal(false)}>
                    <div className="modal-content" style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <ModalHeader title="Créer une session" onClose={() => setShowModal(false)} />
                        <form onSubmit={handleSubmit}>
                            <ModalInputRow
                                label="Code session"
                                value={newSession.codeSession}
                                onChange={(value) => setNewSession({ ...newSession, codeSession: value })}
                                placeholder="Ex: SES-001"
                            />
                            <ModalInputRow
                                label="Date"
                                type="date"
                                value={newSession.date}
                                onChange={(value) => setNewSession({ ...newSession, date: value })}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <ModalInputRow
                                    label="Début"
                                    type="time"
                                    value={newSession.heureDebut}
                                    onChange={(value) => setNewSession({ ...newSession, heureDebut: value })}
                                />
                                <ModalInputRow
                                    label="Fin"
                                    type="time"
                                    value={newSession.heureFin}
                                    onChange={(value) => setNewSession({ ...newSession, heureFin: value })}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={modalLabelStyle}>Mode</label>
                                <select
                                    value={newSession.type}
                                    onChange={(e) => setNewSession({ ...newSession, type: e.target.value as SessionData['type'] })}
                                    style={modalSelectStyle}
                                >
                                    <option value="presentiel">Présentiel</option>
                                    <option value="en_ligne">En ligne</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={modalSecondaryButton}>Annuler</button>
                                <button type="submit" style={modalPrimaryButton}>Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSessionsModal && (
                <div className="modal-overlay" style={modalOverlayStyle} onClick={() => setShowSessionsModal(false)}>
                    <div className="modal-content" style={{ ...modalContentStyle, maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
                        <ModalHeader title="Sessions du cours" subtitle={cours.titre} onClose={() => setShowSessionsModal(false)} />
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <Badge>{filteredSessions.length} sessions</Badge>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
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
                            {sessionsLoading && (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Chargement des sessions...</div>
                            )}
                            {sessionsError && !sessionsLoading && (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626' }}>{sessionsError}</div>
                            )}
                            {!sessionsLoading && !sessionsError && filteredSessions.map(session => {
                                const isTerminee = session.status === 'TERMINEE';
                                return (
                                    <div key={session.id} style={{
                                        padding: '14px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        background: isTerminee ? '#f0fdf4' : 'white'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {session.codeSession ?? session.libelle}
                                                    {isTerminee && (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '500', background: '#10b981', color: 'white' }}>
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
                                                    background: session.modeSession === 'PRESENTIEL' ? '#E3F2FD' : '#FFF3E0',
                                                    color: session.modeSession === 'PRESENTIEL' ? '#5B8DEF' : '#FF9800'
                                                }}>
                                                    {session.modeSession === 'PRESENTIEL' ? 'Présentiel' : session.modeSession === 'EN_LIGNE' ? 'En ligne' : 'Hybride'}
                                                </div>
                                            </div>
                                            <button disabled style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: '#FFEBEE'
                                            }}>
                                                <Trash2 size={14} color="#e53e3e" />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#4a5568' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Clock size={14} />
                                                <span>{session.startHour} - {session.endHour}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={14} />
                                                <span>{session.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalOverlayStyle: React.CSSProperties = {
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
};

const modalContentStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    width: '90%',
    maxWidth: '520px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'slideIn 0.3s ease'
};

const modalLabelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '8px'
};

const modalSelectStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
    background: 'white',
    cursor: 'pointer'
};

const modalSecondaryButton: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    background: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
};

const modalPrimaryButton: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(91,141,239,0.3)'
};

const Badge = ({ children }: { children: React.ReactNode }) => (
    <div style={{
        padding: '6px 12px',
        background: '#f8fafc',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#64748b'
    }}>
        {children}
    </div>
);

interface ModalHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
}

function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        }}>
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c', margin: 0 }}>{title}</h3>
                {subtitle && <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: '#f1f5f9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <X size={18} color="#64748b" />
            </button>
        </div>
    );
}

interface ModalInputRowProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}

function ModalInputRow({ label, value, onChange, placeholder, type = 'text' }: ModalInputRowProps) {
    return (
        <div style={{ marginBottom: '16px' }}>
            <label style={modalLabelStyle}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'inherit'
                }}
            />
        </div>
    );
}
