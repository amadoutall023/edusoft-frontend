'use client';

import React, { useState, useMemo } from 'react';
import { SeancePlanning, JourSemaine } from '../types';
import { JOUR_OPTIONS } from '../constants';
import { Plus, Clock, User, MapPin, BookOpen, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';

interface PlanningMobileViewProps {
    seances: SeancePlanning[];
    onSeanceClick: (seance: SeancePlanning) => void;
    onAddSeance?: (jour: JourSemaine) => void;
    currentPlanning: boolean;
}

interface SeancesParJour {
    [jour: string]: SeancePlanning[];
}

export default function PlanningMobileView({
    seances,
    onSeanceClick,
    onAddSeance,
    currentPlanning
}: PlanningMobileViewProps) {
    // État pour les jours dépliables
    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        JOUR_OPTIONS.forEach(jour => {
            initial[jour] = true;
        });
        return initial;
    });

    // Grouper les séances par jour
    const seancesParJour: SeancesParJour = JOUR_OPTIONS.reduce((acc, jour) => {
        acc[jour] = [];
        return acc;
    }, {} as SeancesParJour);

    // Trier les séances par heure de début
    const sortedSeances = [...seances].sort((a, b) => {
        return a.heureDebut.localeCompare(b.heureDebut);
    });

    // Distribuer les séances dans les jours correspondants
    sortedSeances.forEach(seance => {
        if (seancesParJour[seance.jour]) {
            seancesParJour[seance.jour].push(seance);
        }
    });

    // Fonction pour basculer l'état dépliable d'un jour
    const toggleDay = (jour: string) => {
        setExpandedDays(prev => ({
            ...prev,
            [jour]: !prev[jour]
        }));
    };

    // Calculer le jour actuel pour surligner
    const today = useMemo(() => {
        const now = new Date();
        const dayIndex = now.getDay();
        const joursInverse = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return joursInverse[dayIndex] as JourSemaine;
    }, []);

    const getJourLabel = (jour: string): string => {
        const jourIndex = JOUR_OPTIONS.indexOf(jour as JourSemaine);
        if (jourIndex === -1) return jour;

        const aujourdhui = new Date();
        const jourSemaine = JOUR_OPTIONS[jourIndex];

        const startOfWeek = new Date(aujourdhui);
        const day = startOfWeek.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        startOfWeek.setDate(aujourdhui.getDate() + diff + jourIndex);

        const dateStr = startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
        return `${jourSemaine} - ${dateStr}`;
    };

    const hasSeances = Object.values(seancesParJour).some(daySeances => daySeances.length > 0);

    if (!hasSeances) {
        return (
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#64748b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px'
            }}>
                <div style={{
                    fontSize: '64px',
                    marginBottom: '20px',
                    animation: 'float 3s ease-in-out infinite'
                }}>
                    📅
                </div>
                <p style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: '#475569'
                }}>
                    Aucune séance planifiée
                </p>
                <p style={{
                    fontSize: '14px',
                    color: '#94a3b8',
                    maxWidth: '280px',
                    lineHeight: '1.5'
                }}>
                    {currentPlanning
                        ? 'Cliquez sur + pour ajouter une séance'
                        : 'Sélectionnez une classe et une semaine pour voir le planning'}
                </p>
                <style jsx>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '0 0 20px 0',
            overflowY: 'auto',
            flex: 1
        }}>
            {JOUR_OPTIONS.map(jour => {
                const jourSeances = seancesParJour[jour];
                const isToday = jour === today;
                const isExpanded = expandedDays[jour];

                return (
                    <div key={jour} style={{
                        background: isToday ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : 'white',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: isToday
                            ? '0 4px 20px rgba(91,141,239,0.25)'
                            : '0 2px 12px rgba(0,0,0,0.05)',
                        border: isToday ? '2px solid #5B8DEF' : '1px solid #e2e8f0'
                    }}>
                        {/* En-tête du jour - Cliquable pour déplier/replier */}
                        <div
                            onClick={() => toggleDay(jour)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px',
                                background: isToday
                                    ? 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)'
                                    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: isToday ? 'rgba(255,255,255,0.25)' : 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }}>
                                    {isToday ? (
                                        <GraduationCap size={22} color="white" />
                                    ) : (
                                        <Clock size={20} color="white" />
                                    )}
                                </div>
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span style={{
                                            fontWeight: '700',
                                            fontSize: '16px',
                                            color: isToday ? 'white' : '#1e293b'
                                        }}>
                                            {jour}
                                        </span>
                                        {isToday && (
                                            <span style={{
                                                background: 'rgba(255,255,255,0.25)',
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                AUJOURD'HUI
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: isToday ? 'rgba(255,255,255,0.8)' : '#64748b'
                                    }}>
                                        {jourSeances.length} séance{jourSeances.length !== 1 ? 's' : ''} • {getJourLabel(jour)}
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {currentPlanning && onAddSeance && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddSeance(jour as JourSemaine);
                                        }}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: isToday ? 'rgba(255,255,255,0.25)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 2px 8px rgba(34,197,94,0.3)'
                                        }}
                                        title="Ajouter une séance"
                                    >
                                        <Plus size={18} color="white" />
                                    </button>
                                )}
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    background: isToday ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {isExpanded ? (
                                        <ChevronUp size={18} color={isToday ? 'white' : '#64748b'} />
                                    ) : (
                                        <ChevronDown size={18} color={isToday ? 'white' : '#64748b'} />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contenu dépliable */}
                        <div style={{
                            maxHeight: isExpanded ? '2000px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease-in-out, padding 0.3s ease'
                        }}>
                            <div style={{ padding: isExpanded ? '12px' : '0 12px' }}>
                                {jourSeances.length > 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                    }}>
                                        {jourSeances.map((seance, index) => (
                                            <div
                                                key={seance.id}
                                                onClick={() => onSeanceClick(seance)}
                                                style={{
                                                    background: 'white',
                                                    borderRadius: '14px',
                                                    padding: '16px',
                                                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                                    border: '1px solid #e2e8f0',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    position: 'relative',
                                                    animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                                                }}
                                            >
                                                {/* Indicateur de couleur */}
                                                <div style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: '16px',
                                                    bottom: '16px',
                                                    width: '4px',
                                                    background: seance.couleur,
                                                    borderRadius: '0 2px 2px 0'
                                                }} />

                                                {/* Horaire et statut */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '12px'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: '#5B8DEF',
                                                        fontWeight: '700',
                                                        fontSize: '14px'
                                                    }}>
                                                        <Clock size={16} />
                                                        <span>{seance.heureDebut} - {seance.heureFin}</span>
                                                    </div>
                                                    <div style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        background: seance.couleur,
                                                        color: 'white',
                                                        fontSize: '10px',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {seance.status || 'Programme'}
                                                    </div>
                                                </div>

                                                {/* Cours */}
                                                <div style={{
                                                    fontWeight: '700',
                                                    fontSize: '16px',
                                                    color: '#1e293b',
                                                    marginBottom: '8px',
                                                    paddingLeft: '8px'
                                                }}>
                                                    {seance.cours}
                                                </div>

                                                {/* Classe */}
                                                {seance.classe && (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: '#64748b',
                                                        fontSize: '13px',
                                                        marginBottom: '12px',
                                                        paddingLeft: '8px'
                                                    }}>
                                                        <BookOpen size={14} />
                                                        <span style={{ fontWeight: '500' }}>{seance.classe}</span>
                                                    </div>
                                                )}

                                                {/* Informations supplémentaires */}
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '8px',
                                                    paddingTop: '12px',
                                                    borderTop: '1px solid #f1f5f9',
                                                    paddingLeft: '8px'
                                                }}>
                                                    {seance.professeur && seance.professeur !== 'Non assigné' && (
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            color: '#475569',
                                                            fontSize: '12px',
                                                            background: '#f8fafc',
                                                            padding: '6px 10px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            <User size={13} />
                                                            <span style={{ fontWeight: '600' }}>{seance.professeur}</span>
                                                        </div>
                                                    )}

                                                    {seance.salle && seance.salle !== 'Salle' && (
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            color: '#475569',
                                                            fontSize: '12px',
                                                            background: '#f8fafc',
                                                            padding: '6px 10px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            <MapPin size={13} />
                                                            <span style={{ fontWeight: '600' }}>{seance.salle}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {seance.moduleLibelle && (
                                                    <div style={{
                                                        marginTop: '12px',
                                                        fontSize: '12px',
                                                        color: '#94a3b8',
                                                        fontStyle: 'italic',
                                                        paddingLeft: '8px'
                                                    }}>
                                                        📚 Module: {seance.moduleLibelle}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    currentPlanning && onAddSeance && (
                                        <div style={{
                                            padding: '20px',
                                            textAlign: 'center',
                                            background: '#f8fafc',
                                            borderRadius: '12px',
                                            border: '1px dashed #cbd5e1',
                                            marginTop: '4px'
                                        }}>
                                            <button
                                                onClick={() => onAddSeance(jour as JourSemaine)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    margin: '0 auto',
                                                    padding: '12px 20px',
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '10px',
                                                    color: '#64748b',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#5B8DEF';
                                                    e.currentTarget.style.color = '#5B8DEF';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                    e.currentTarget.style.color = '#64748b';
                                                }}
                                            >
                                                <Plus size={16} />
                                                Ajouter une séance
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
