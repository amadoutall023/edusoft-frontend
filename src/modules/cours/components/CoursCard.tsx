'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Play, Archive, Pencil, Trash2, X, Eye, Clock, Calendar, Search, Check, Users, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Cours } from '../types';
import { fetchSessions, createSession, updateSession } from '@/modules/planning/services/sessionService';
import { SessionResponseDto, SessionMode, SessionType, SessionStatus } from '@/shared/api/types';
import CourseSupportModal from './CourseSupportModal';
import Swal from 'sweetalert2';

interface SessionFormData {
    date: string;
    startHour: string;
    endHour: string;
    modeSession: SessionMode;
    typeSession: SessionType;
    libelle: string;
}

interface CoursCardProps {
    cours: Cours;
    showActions?: boolean;
    showCreateSession?: boolean;
    readOnly?: boolean;
    showSupportAccess?: boolean;
    canManageSupports?: boolean;
    canAccessEmargement?: boolean;
    onArchive?: (id: string) => void;
    onEdit?: (cours: Cours) => void;
    onDelete?: (id: string) => void;
    isArchiveView?: boolean;
}

export default function CoursCard({
    cours,
    showActions = true,
    showCreateSession,
    readOnly = false,
    showSupportAccess = false,
    canManageSupports = false,
    canAccessEmargement = true,
    onArchive,
    onEdit,
    onDelete,
    isArchiveView
}: CoursCardProps) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [showSessionsModal, setShowSessionsModal] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [courseSummary, setCourseSummary] = useState<string>(cours.summary ?? '');
    const [sessionSearchTerm, setSessionSearchTerm] = useState('');
    const [newSession, setNewSession] = useState<SessionFormData>({
        date: '',
        startHour: '',
        endHour: '',
        modeSession: 'PRESENTIEL',
        typeSession: 'AUTRE',
        libelle: ''
    });
    const [sessions, setSessions] = useState<SessionResponseDto[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [sessionsError, setSessionsError] = useState<string | null>(null);


    useEffect(() => {
        const load = async () => {
            try {
                setSessionsLoading(true);
                const { data } = await fetchSessions({ coursId: cours.id, size: 50 });
                console.log('Sessions loaded:', JSON.stringify(data, null, 2));
                setSessions(data ?? []);
                setSessionsError(null);
            } catch (err) {
                console.error('Erreur chargement sessions:', err);
                setSessionsError('Impossible de charger les sessions.');
            } finally {
                setSessionsLoading(false);
            }
        };

        // Charger les sessions dès le montage du composant
        load();
    }, [cours.id]);

    const filteredSessions = useMemo(() => {
        return sessions.filter(session =>
            (session.codeSession ?? '').toLowerCase().includes(sessionSearchTerm.toLowerCase()) ||
            session.date.includes(sessionSearchTerm)
        );
    }, [sessions, sessionSearchTerm]);

    // Calculer les heures depuis les sessions
    const { heuresPlanifie, heuresFaites, heuresRestantes } = useMemo(() => {
        // Calculer le total des heures planifiées (toutes les sessions sauf TERMINEE et ANNULEE)
        const totalPlanned = sessions.reduce((acc, session) => {
            if (session.status !== 'TERMINEE' && session.status !== 'ANNULE') {
                const duration = session.duration ?? 0;
                return acc + (duration / 60);
            }
            return acc;
        }, 0);

        // Calculer le total des heures terminées
        const totalCompleted = sessions.reduce((acc, session) => {
            if (session.status === 'TERMINEE') {
                const duration = session.duration ?? 0;
                console.log('Session completed:', session.id, 'duration:', duration);
                return acc + (duration / 60);
            }
            return acc;
        }, 0);

        // Le restant est basé sur le volume horaire total du cours.
        const remaining = Math.max(0, cours.volumeHoraire - totalCompleted);

        console.log('Heures calculées - Planifiées:', totalPlanned, 'Terminées:', totalCompleted, 'Restantes:', remaining);

        return {
            heuresPlanifie: Math.round(totalPlanned * 10) / 10,
            heuresFaites: Math.round(totalCompleted * 10) / 10,
            heuresRestantes: Math.round(remaining * 10) / 10
        };
    }, [sessions, cours.volumeHoraire]);

    const handleArchive = () => {
        if (onArchive) {
            onArchive(cours.id);
        }
    };


    const [actionLoading, setActionLoading] = useState<string | null>(null);


    const handleSessionStatusChange = async (sessionId: string, newStatus: SessionStatus) => {
        try {
            setActionLoading(sessionId);
            const session = sessions.find(s => s.id === sessionId);
            if (!session) return;


            const sessionData = {
                date: session.date,
                startHour: session.startHour,
                endHour: session.endHour,
                modeSession: session.modeSession,
                typeSession: session.typeSession,
                status: newStatus,
                libelle: session.libelle,
                coursId: cours.id,
                professorId: cours.professorId || null,
                moduleId: cours.moduleId || null,
                sessionSummary: session.sessionSummary
            };

            const updatedSession = await updateSession(sessionId, sessionData);

            // Mettre à jour la liste des sessions
            setSessions(prev => prev.map(s =>
                s.id === sessionId ? updatedSession : s
            ));
        } catch (err) {
            console.error('Erreur lors de la mise à jour du statut:', err);
            Swal.fire({
                title: 'Erreur',
                text: 'Erreur lors de la mise à jour du statut de la session.',
                icon: 'error'
            });
        } finally {
            setActionLoading(null);
        }
    };

    const getProgressColor = (progression: number) => {
        if (progression >= 80) return '#10b981';
        if (progression >= 60) return '#fbbf24';
        if (progression >= 40) return '#fb923c';
        return '#ef4444';
    };

    const [isCreatingSession, setIsCreatingSession] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newSession.date || !newSession.startHour || !newSession.endHour) {
            Swal.fire({
                title: 'Attention',
                text: 'Veuillez remplir tous les champs obligatoires.',
                icon: 'warning'
            });
            return;
        }

        try {
            setIsCreatingSession(true);

            const sessionData = {
                date: newSession.date,
                startHour: newSession.startHour,
                endHour: newSession.endHour,
                modeSession: newSession.modeSession,
                typeSession: newSession.typeSession,
                libelle: newSession.libelle || `Session - ${cours.titre}`,
                coursId: cours.id,
                professorId: cours.professorId || null,
                moduleId: cours.moduleId || null,
                status: 'PROGRAMME' as const
            };

            console.log('Creating session with professorId:', cours.professorId, 'from course:', cours);

            await createSession(sessionData);

            const { data } = await fetchSessions({ coursId: cours.id, size: 50 });
            setSessions(data ?? []);

            setShowModal(false);
            setNewSession({
                date: '',
                startHour: '',
                endHour: '',
                modeSession: 'PRESENTIEL',
                typeSession: 'AUTRE',
                libelle: ''
            });
            Swal.fire({
                title: 'Succès !',
                text: 'Session créée avec succès!',
                icon: 'success'
            });
        } catch (err) {
            console.error('Erreur lors de la création de la session:', err);
            Swal.fire({
                title: 'Erreur',
                text: 'Impossible de créer la session. Veuillez réessayer.',
                icon: 'error'
            });
        } finally {
            setIsCreatingSession(false);
        }
    };

    const progressColor = getProgressColor(cours.progression);

    return (
        <>
            <style>{`
                @media (max-width: 768px) {
                    .session-modal {
                        max-width: 100% !important;
                        margin: 10px !important;
                    }
                    .session-card {
                        padding: 10px !important;
                    }
                    .session-time {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 4px !important;
                    }
                    .session-actions {
                        flex-direction: column !important;
                    }
                    .session-actions button {
                        width: 100% !important;
                    }
                }
            `}</style>
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
                        {showActions && onEdit && (
                            <button
                                title="Modifier"
                                onClick={() => onEdit(cours)}
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
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#5B8DEF';
                                    e.currentTarget.querySelector('svg')!.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#E3F2FD';
                                    e.currentTarget.querySelector('svg')!.style.color = '#5B8DEF';
                                }}
                            >
                                <Pencil size={16} color="#5B8DEF" strokeWidth={2.5} />
                            </button>
                        )}
                        {showActions && onDelete && (
                            <button
                                title="Supprimer"
                                onClick={async () => {
                                    const result = await Swal.fire({
                                        title: 'Êtes-vous sûr ?',
                                        text: "Vous ne pourrez pas récupérer ce cours !",
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonText: 'Oui, supprimer',
                                        cancelButtonText: 'Annuler',
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#3085d6',
                                    });
                                    if (result.isConfirmed) {
                                        onDelete(cours.id);
                                    }
                                }}
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
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e53e3e';
                                    e.currentTarget.querySelector('svg')!.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#FFEBEE';
                                    e.currentTarget.querySelector('svg')!.style.color = '#e53e3e';
                                }}
                            >
                                <Trash2 size={16} color="#e53e3e" strokeWidth={2.5} />
                            </button>
                        )}
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
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.background = '#4CAF50';
                                e.currentTarget.querySelector('svg').style.color = 'white';
                            }}
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.background = '#E8F5E9';
                                e.currentTarget.querySelector('svg').style.color = '#4CAF50';
                            }}
                        >
                            <Eye size={16} color="#4CAF50" strokeWidth={2.5} />
                        </button>
                        {showSupportAccess && (
                            <button
                                title="Supports de cours"
                                onClick={() => setShowSupportModal(true)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#ede9fe',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <ClipboardList size={16} color="#6d28d9" strokeWidth={2.5} />
                            </button>
                        )}
                        <button
                            title="Créer session du cours"
                            onClick={() => setShowModal(true)}
                            style={{
                                display: (showActions || showCreateSession) && !readOnly ? 'inline-flex' : 'none',
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
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.background = '#5B8DEF';
                                e.currentTarget.querySelector('svg').style.color = 'white';
                            }}
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.background = '#E3F2FD';
                                e.currentTarget.querySelector('svg').style.color = '#5B8DEF';
                            }}
                        >
                            <Play size={16} color="#5B8DEF" strokeWidth={2.5} />
                        </button>
                        {showActions && onArchive && (
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
                                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.currentTarget.style.background = isArchiveView ? '#4CAF50' : '#FF9800';
                                    e.currentTarget.querySelector('svg').style.color = 'white';
                                }}
                                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
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
                        )}
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
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{heuresPlanifie} h <span style={{ fontSize: '10px', color: '#ccc' }}>({sessions.length} sessions)</span></div>
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8' }}>Réalisé</div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{heuresFaites} h</div>
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8' }}>Restant</div>
                        <div style={{ fontWeight: '600', color: heuresRestantes === 0 ? '#10b981' : '#1e293b' }}>{heuresRestantes} h</div>
                    </div>
                </div>

                {/* Modals retain original structure */}
                {showModal && (
                    <div className="modal-overlay" style={modalOverlayStyle} onClick={() => setShowModal(false)}>
                        <div className="modal-content" style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                            <ModalHeader title="Créer une session" onClose={() => setShowModal(false)} />
                            <form onSubmit={handleSubmit}>
                               
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
                                        value={newSession.startHour}
                                        onChange={(value) => setNewSession({ ...newSession, startHour: value })}
                                    />
                                    <ModalInputRow
                                        label="Fin"
                                        type="time"
                                        value={newSession.endHour}
                                        onChange={(value) => setNewSession({ ...newSession, endHour: value })}
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={modalLabelStyle}>Mode</label>
                                    <select
                                        value={newSession.modeSession}
                                        onChange={(e) => setNewSession({ ...newSession, modeSession: e.target.value as SessionMode })}
                                        style={modalSelectStyle}
                                    >
                                        <option value="PRESENTIEL">Présentiel</option>
                                        <option value="EN_LIGNE">En ligne</option>
                                        <option value="HYBRIDE">Hybride</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={modalLabelStyle}>Type</label>
                                    <select
                                        value={newSession.typeSession}
                                        onChange={(e) => setNewSession({ ...newSession, typeSession: e.target.value as SessionType })}
                                        style={modalSelectStyle}
                                    >
                                        <option value="AUTRE">Autre</option>
                                        <option value="COURS">Cours</option>
                                        <option value="EVALUATION">Évaluation</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setShowModal(false)} style={modalSecondaryButton}>Annuler</button>
                                    <button type="submit" disabled={isCreatingSession} style={{ ...modalPrimaryButton, opacity: isCreatingSession ? 0.7 : 1 }}>
                                        {isCreatingSession ? 'Création...' : 'Créer la session'}
                                    </button>
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
                                    const isAnnule = session.status === 'ANNULE';
                                    const isProgramme = session.status === 'PROGRAMME' || session.status === 'EN_COURS';

                                    // Convertir les minutes en heures pour l'affichage
                                    const displayDuration = session.duration ? Math.floor(session.duration / 60) : 0;
                                    const remainingMinutes = session.duration ? session.duration % 60 : 0;
                                    const durationText = displayDuration > 0
                                        ? `${displayDuration}h${remainingMinutes > 0 ? remainingMinutes + 'min' : ''}`
                                        : (remainingMinutes > 0 ? `${remainingMinutes}min` : '');

                                    return (
                                        <div key={session.id} style={{
                                            padding: '14px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            background: isTerminee ? '#f0fdf4' : isAnnule ? '#fef2f2' : 'white'
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
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#4a5568' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Clock size={14} />
                                                    <span>{session.startHour} - {session.endHour}</span>
                                                    {session.duration && <span style={{ fontSize: '11px', color: '#9ca3af' }}>({durationText})</span>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Calendar size={14} />
                                                    <span>{session.date}</span>
                                                </div>
                                            </div>

                                            {/* Afficher les étudiants s'ils sont disponibles */}
                                            {session.students && session.students.length > 0 && (
                                                <div style={{ marginTop: '10px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                                                        <Users size={14} />
                                                        {session.students.length} étudiant(s) - Émargement
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                        {session.students.slice(0, 5).map(student => (
                                                            <span key={student.id} style={{
                                                                display: 'inline-flex',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontSize: '10px',
                                                                background: '#e2e8f0',
                                                                color: '#475569'
                                                            }}>
                                                                {student.prenom} {student.nom}
                                                            </span>
                                                        ))}
                                                        {session.students.length > 5 && (
                                                            <span style={{ fontSize: '10px', color: '#64748b' }}>
                                                                +{session.students.length - 5} autres
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Boutons Terminer/Annuler et Émargement */}
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                                                {isProgramme && !readOnly && (
                                                    <>
                                                        <button
                                                            onClick={() => handleSessionStatusChange(session.id, 'TERMINEE')}
                                                            disabled={actionLoading === session.id}
                                                            style={{
                                                                flex: 1,
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                                padding: '8px 12px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: '#10b981',
                                                                color: 'white',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                cursor: actionLoading === session.id ? 'not-allowed' : 'pointer',
                                                                opacity: actionLoading === session.id ? 0.7 : 1
                                                            }}
                                                        >
                                                            <Check size={14} />
                                                            {actionLoading === session.id ? '...' : 'Terminer'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleSessionStatusChange(session.id, 'ANNULE')}
                                                            disabled={actionLoading === session.id}
                                                            style={{
                                                                flex: 1,
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                                padding: '8px 12px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: '#f59e0b',
                                                                color: 'white',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                cursor: actionLoading === session.id ? 'not-allowed' : 'pointer',
                                                                opacity: actionLoading === session.id ? 0.7 : 1
                                                            }}
                                                        >
                                                            <X size={14} />
                                                            {actionLoading === session.id ? '...' : 'Annuler'}
                                                        </button>
                                                    </>
                                                )}
                                                {canAccessEmargement && (
                                                    <button
                                                        onClick={() => {
                                                            router.push(`/dashboard/emargement/${session.id}`);
                                                        }}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                            padding: '8px 12px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            background: '#6366f1',
                                                            color: 'white',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            cursor: 'pointer',
                                                            flex: isProgramme ? undefined : 1
                                                        }}
                                                    >
                                                        <ClipboardList size={14} />
                                                        {readOnly || isTerminee ? 'Voir émargement' : 'Émargement'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Panneau d'émargement - affiché sur une page dédiée */}
            </div>
            <CourseSupportModal
                coursId={cours.id}
                coursTitle={cours.titre}
                initialSummary={courseSummary}
                readOnly={!canManageSupports}
                open={showSupportModal}
                onClose={() => setShowSupportModal(false)}
                onSummarySaved={setCourseSummary}
            />
        </>
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
    cursor: 'pointer',
    color: '#1a202c'
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
                    fontFamily: 'inherit',
                    color: '#1a202c',
                    background: 'white'
                }}
            />
        </div>
    );
}

