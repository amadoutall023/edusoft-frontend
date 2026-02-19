'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronDown, X, GripVertical, Trash2, Edit2, Calendar, Layers, RotateCw } from 'lucide-react';
import { SeancePlanning, PlanningSemaine } from '../types';
import { planningsSemaine, seances as initialSeances, creneauxConfig, jours, classes, modules, getSemainesDisponibles } from '../data/planning';

export default function PlanningContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtres, setFiltres] = useState({ classe: '', module: '' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCreatePlanningModal, setShowCreatePlanningModal] = useState(false);
    const [selectedSeance, setSelectedSeance] = useState<SeancePlanning | null>(null);
    const [seances, setSeances] = useState<SeancePlanning[]>(initialSeances);
    const [plannings, setPlannings] = useState<PlanningSemaine[]>(planningsSemaine);
    const [draggedSeance, setDraggedSeance] = useState<SeancePlanning | null>(null);
    const [selectedClasse, setSelectedClasse] = useState<string>('');
    const [selectedSemaine, setSelectedSemaine] = useState<string>('');
    const [currentPlanning, setCurrentPlanning] = useState<PlanningSemaine | null>(null);
    const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('vertical');

    const semaines = useMemo(() => getSemainesDisponibles(), []);

    // Obtenir le planning courant
    useMemo(() => {
        if (selectedClasse && selectedClasse !== 'Toutes les classes' && selectedSemaine) {
            const planning = plannings.find(p => p.classe === selectedClasse && p.semaineDebut === selectedSemaine);
            setCurrentPlanning(planning || null);
        } else {
            setCurrentPlanning(null);
        }
    }, [selectedClasse, selectedSemaine, plannings]);

    // Obtenir les séances à afficher
    const seancesAafficher = useMemo(() => {
        if (currentPlanning) {
            return currentPlanning.seances;
        }
        return seances;
    }, [currentPlanning, seances]);

    // Filter sessions
    const seancesFiltrees = useMemo(() => {
        return seancesAafficher.filter(seance => {
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const match =
                    seance.cours.toLowerCase().includes(search) ||
                    seance.classe.toLowerCase().includes(search) ||
                    seance.professeur.toLowerCase().includes(search);
                if (!match) return false;
            }

            if (filtres.classe && filtres.classe !== 'Toutes les classes') {
                if (seance.classe !== filtres.classe) return false;
            }

            if (filtres.module && filtres.module !== 'Tous les modules') {
                if (seance.cours !== filtres.module) return false;
            }

            return true;
        });
    }, [searchTerm, filtres, seancesAafficher]);

    // Organize sessions by day and time slot
    const planningGrid = useMemo(() => {
        const grid: { [key: string]: { [key: string]: SeancePlanning[] } } = {};

        jours.forEach(jour => {
            grid[jour] = {};
            creneauxConfig.forEach(creneau => {
                grid[jour][creneau.id] = [];
            });
        });

        seancesFiltrees.forEach(seance => {
            const creneauId = `${seance.heureDebut}-${seance.heureFin}`;
            if (grid[seance.jour] && grid[seance.jour][creneauId]) {
                grid[seance.jour][creneauId].push(seance);
            }
        });

        return grid;
    }, [seancesFiltrees]);

    // Fonction pour créer un nouveau planning
    const handleCreatePlanning = (classe: string, semaineId: string) => {
        const semaine = semaines.find(s => s.id === semaineId);
        if (!semaine) return;

        const newPlanning: PlanningSemaine = {
            id: plannings.length + 1,
            semaineDebut: semaine.debut,
            semaineFin: semaine.fin,
            classe,
            creeLe: new Date().toISOString().split('T')[0],
            seances: []
        };

        setPlannings([...plannings, newPlanning]);
        setCurrentPlanning(newPlanning);
        setSelectedClasse(classe);
        setSelectedSemaine(semaineId);
        setShowCreatePlanningModal(false);
    };

    // Fonction pour ajouter une séance
    const handleAddSeance = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const nouvelleSeance: SeancePlanning = {
            id: seances.length + 1,
            idPlanning: currentPlanning?.id || 0,
            classe: formData.get('classe') as string,
            cours: formData.get('cours') as string,
            professeur: formData.get('professeur') as string,
            salle: formData.get('salle') as string,
            jour: formData.get('jour') as string,
            heureDebut: (formData.get('creneau') as string).split('-')[0],
            heureFin: (formData.get('creneau') as string).split('-')[1],
            couleur: ['amber', 'pink', 'green', 'purple', 'blue', 'red'][Math.floor(Math.random() * 6)]
        };

        setSeances([...seances, nouvelleSeance]);

        // Mettre à jour le planning si existant
        if (currentPlanning) {
            setPlannings(plannings.map(p =>
                p.id === currentPlanning.id
                    ? { ...p, seances: [...p.seances, nouvelleSeance] }
                    : p
            ));
            setCurrentPlanning({ ...currentPlanning, seances: [...currentPlanning.seances, nouvelleSeance] });
        }

        setShowAddModal(false);
    };

    // Drag and drop handlers
    const handleDragStart = (seance: SeancePlanning) => {
        setDraggedSeance(seance);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (jour: string, creneauId: string) => {
        if (draggedSeance) {
            const [debut, fin] = creneauId.split('-');
            setSeances(prev => prev.map(s =>
                s.id === draggedSeance.id
                    ? { ...s, jour, heureDebut: debut, heureFin: fin }
                    : s
            ));
            setDraggedSeance(null);
        }
    };

    const handleDeleteSeance = (id: number) => {
        setSeances(prev => prev.filter(s => s.id !== id));
        if (currentPlanning) {
            setPlannings(plannings.map(p =>
                p.id === currentPlanning.id
                    ? { ...p, seances: p.seances.filter(s => s.id !== id) }
                    : p
            ));
            setCurrentPlanning({ ...currentPlanning, seances: currentPlanning.seances.filter(s => s.id !== id) });
        }
        setSelectedSeance(null);
    };

    const getCouleurGradient = (couleur: string) => {
        const couleurs: { [key: string]: string } = {
            amber: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            pink: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            green: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            purple: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            red: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        };
        return couleurs[couleur] || couleurs.blue;
    };

    return (
        <div
            className="planning-container content-scroll"
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 140px)',
                background: 'white',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
            <style jsx>{`
                @media (max-width: 768px) {
                    .planning-container {
                        padding: 8px !important;
                    }
                    .header-controls {
                        flex-wrap: wrap !important;
                    }
                    .view-label {
                        display: inline !important;
                    }
                    .mobile-hidden {
                        display: none !important;
                    }
                }
                @media (max-width: 640px) {
                    .planning-header {
                        padding: 12px 16px !important;
                    }
                    .planning-info {
                        padding: 8px 16px !important;
                        flex-direction: column !important;
                        gap: 8px !important;
                    }
                }
            `}</style>
            {/* Header */}
            <div style={{
                padding: '20px 32px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: 0
                }}>
                    Planning des séances
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '10px 16px 10px 42px',
                                borderRadius: '12px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                width: '200px',
                                background: '#f8fafc'
                            }}
                        />
                    </div>

                    {/* Week Filter */}
                    <div style={{ position: 'relative' }}>
                        <Calendar size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                        <select
                            value={selectedSemaine}
                            onChange={(e) => setSelectedSemaine(e.target.value)}
                            style={{
                                padding: '10px 36px 10px 36px',
                                borderRadius: '12px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#475569',
                                background: '#f8fafc',
                                cursor: 'pointer',
                                appearance: 'none',
                                minWidth: '200px'
                            }}
                        >
                            <option value="">Toutes les semaines</option>
                            {semaines.map(semaine => (
                                <option key={semaine.id} value={semaine.id}>{semaine.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>

                    {/* Class Filter */}
                    <div style={{ position: 'relative' }}>
                        <Layers size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                        <select
                            value={filtres.classe || ''}
                            onChange={(e) => {
                                setFiltres({ ...filtres, classe: e.target.value });
                                setSelectedClasse(e.target.value);
                            }}
                            style={{
                                padding: '10px 36px 10px 36px',
                                borderRadius: '12px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#475569',
                                background: '#f8fafc',
                                cursor: 'pointer',
                                appearance: 'none',
                                minWidth: '150px'
                            }}
                        >
                            {classes.map(classe => (
                                <option key={classe} value={classe}>{classe}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>

                    {/* Create Planning Button */}
                    <button
                        onClick={() => setShowCreatePlanningModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(91,141,239,0.3)'
                        }}
                    >
                        <Plus size={18} />
                        Nouveau Planning
                    </button>

                    {/* View Toggle Button */}
                    <button
                        onClick={() => setViewMode(viewMode === 'vertical' ? 'horizontal' : 'vertical')}
                        title={viewMode === 'vertical' ? 'Vue horizontale' : 'Vue verticale'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            background: viewMode === 'horizontal' ? 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)' : 'white',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '12px',
                            color: viewMode === 'horizontal' ? 'white' : '#64748b',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                    >
                        <RotateCw size={18} />
                        <span className="view-label" style={{ display: 'none' }}>{viewMode === 'vertical' ? 'H' : 'V'}</span>
                    </button>

                    {/* Add Course Button */}
                    {currentPlanning && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(34,197,94,0.3)'
                            }}
                        >
                            <Plus size={18} />
                            Ajouter
                        </button>
                    )}
                </div>
            </div>

            {/* Planning Info */}
            {currentPlanning && (
                <div style={{
                    padding: '12px 32px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    borderBottom: '1px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Calendar size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', color: '#0369a1', fontSize: '14px' }}>
                                Planning: {currentPlanning.classe}
                            </div>
                            <div style={{ fontSize: '12px', color: '#0c4a6e' }}>
                                Semaine du {new Date(currentPlanning.semaineDebut).toLocaleDateString('fr-FR')} au {new Date(currentPlanning.semaineFin).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#0369a1' }}>
                        {currentPlanning.seances.length} séance(s) planifiée(s)
                    </div>
                </div>
            )}

            {/* Planning Grid */}
            <div style={{
                flex: 1,
                padding: '16px 24px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Days Header - Vertical Mode */}
                {viewMode === 'vertical' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '100px repeat(6, 1fr)',
                        gap: '8px',
                        marginBottom: '8px',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                                onClick={() => currentPlanning && setShowAddModal(true)}
                            >
                                <Plus size={20} color={currentPlanning ? "#64748b" : "#cbd5e1"} style={{ cursor: currentPlanning ? 'pointer' : 'not-allowed' }} />
                            </div>
                        </div>

                        {jours.map(jour => (
                            <div key={jour} style={{
                                background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                color: 'white',
                                textAlign: 'center',
                                padding: '12px',
                                borderRadius: '12px',
                                fontWeight: '600',
                                fontSize: '13px',
                                boxShadow: '0 4px 12px rgba(91,141,239,0.35)'
                            }}>
                                {jour}
                            </div>
                        ))}
                    </div>
                )}

                {/* Days Header - Horizontal Mode */}
                {viewMode === 'horizontal' && (
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '8px',
                        flexShrink: 0,
                        overflowX: 'auto',
                        paddingBottom: '8px'
                    }}>
                        <div style={{
                            width: '80px',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                                onClick={() => currentPlanning && setShowAddModal(true)}
                            >
                                <Plus size={18} color={currentPlanning ? "#64748b" : "#cbd5e1"} style={{ cursor: currentPlanning ? 'pointer' : 'not-allowed' }} />
                            </div>
                        </div>

                        {creneauxConfig.map(creneau => (
                            <div key={creneau.id} style={{
                                background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                color: 'white',
                                textAlign: 'center',
                                padding: '10px 8px',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '11px',
                                boxShadow: '0 4px 12px rgba(91,141,239,0.35)',
                                minWidth: '70px',
                                flexShrink: 0
                            }}>
                                {creneau.label}
                            </div>
                        ))}
                    </div>
                )}

                {/* Time Slots - Vertical Mode */}
                {viewMode === 'vertical' && (
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}>
                        {creneauxConfig.map(creneau => (
                            <div
                                key={creneau.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '100px repeat(6, 1fr)',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}
                            >
                                {/* Time */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    color: '#475569',
                                    fontSize: '11px',
                                    padding: '8px 4px',
                                    minHeight: '60px'
                                }}>
                                    <span>{creneau.debut}</span>
                                    <span style={{ opacity: 0.6, fontSize: '9px' }}>à</span>
                                    <span>{creneau.fin}</span>
                                </div>

                                {/* Days as columns */}
                                {jours.map(jour => {
                                    const seancesCellule = planningGrid[jour]?.[creneau.id] || [];

                                    return (
                                        <div
                                            key={`${jour}-${creneau.id}`}
                                            style={{
                                                background: seancesCellule.length > 0 ? '#fafbfc' : 'white',
                                                border: seancesCellule.length > 0 ? '1.5px solid #e2e8f0' : '1.5px dashed #e2e8f0',
                                                borderRadius: '10px',
                                                padding: '4px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px',
                                                minHeight: '60px'
                                            }}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(jour, creneau.id)}
                                        >
                                            {/* Each course takes its own row */}
                                            {seancesCellule.length > 0 ? (
                                                seancesCellule.map(seance => (
                                                    <div
                                                        key={seance.id}
                                                        draggable
                                                        onDragStart={() => handleDragStart(seance)}
                                                        onClick={() => setSelectedSeance(seance)}
                                                        style={{
                                                            background: getCouleurGradient(seance.couleur),
                                                            borderRadius: '6px',
                                                            padding: '6px 8px',
                                                            color: 'white',
                                                            cursor: 'grab',
                                                            fontSize: '10px',
                                                            borderLeft: '3px solid rgba(255,255,255,0.5)'
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: '700', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <span>{seance.classe}</span>
                                                        </div>
                                                        <div style={{ fontWeight: '600', fontSize: '9px', marginTop: '2px' }}>{seance.cours}</div>
                                                        <div style={{ fontSize: '8px', opacity: 0.9 }}>{seance.professeur}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {currentPlanning && (
                                                        <button
                                                            onClick={() => setShowAddModal(true)}
                                                            style={{
                                                                width: '24px',
                                                                height: '24px',
                                                                border: 'none',
                                                                background: '#f1f5f9',
                                                                borderRadius: '50%',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                opacity: 0.5
                                                            }}
                                                        >
                                                            <Plus size={12} color="#94a3b8" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}

                {/* Time Slots - Horizontal Mode */}
                {viewMode === 'horizontal' && (
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'auto'
                    }}>
                        {jours.map(jour => (
                            <div
                                key={jour}
                                style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '6px',
                                    minHeight: '70px'
                                }}
                            >
                                {/* Day */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    color: '#475569',
                                    fontSize: '11px',
                                    padding: '4px',
                                    width: '80px',
                                    flexShrink: 0
                                }}>
                                    <span>{jour}</span>
                                </div>

                                {/* Cells */}
                                {creneauxConfig.map(creneau => {
                                    const seancesCellule = planningGrid[jour]?.[creneau.id] || [];

                                    return (
                                        <div
                                            key={`${jour}-${creneau.id}`}
                                            style={{
                                                background: seancesCellule.length > 0 ? '#fafbfc' : 'white',
                                                border: seancesCellule.length > 0 ? '1.5px solid #e2e8f0' : '1.5px dashed #e2e8f0',
                                                borderRadius: '10px',
                                                padding: '4px',
                                                minWidth: '70px',
                                                flexShrink: 0,
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px'
                                            }}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(jour, creneau.id)}
                                        >
                                            {seancesCellule.length > 0 ? (
                                                seancesCellule.map(seance => (
                                                    <div
                                                        key={seance.id}
                                                        draggable
                                                        onDragStart={() => handleDragStart(seance)}
                                                        onClick={() => setSelectedSeance(seance)}
                                                        style={{
                                                            background: getCouleurGradient(seance.couleur),
                                                            borderRadius: '6px',
                                                            padding: '4px 6px',
                                                            color: 'white',
                                                            cursor: 'grab'
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: '700', fontSize: '9px' }}>{seance.classe}</div>
                                                        <div style={{ fontWeight: '600', fontSize: '9px' }}>{seance.cours}</div>
                                                    </div>
                                                ))
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Session Details Modal */}
            {selectedSeance && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(4px)'
                }}
                    onClick={() => setSelectedSeance(null)}
                >
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '28px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                                Détails de la séance
                            </h2>
                            <button
                                onClick={() => setSelectedSeance(null)}
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

                        <div style={{
                            background: getCouleurGradient(selectedSeance.couleur),
                            borderRadius: '12px',
                            padding: '16px',
                            color: 'white',
                            marginBottom: '20px'
                        }}>
                            <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{selectedSeance.classe}</div>
                            <div style={{ fontWeight: '600', fontSize: '15px' }}>{selectedSeance.cours}</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Professeur</div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{selectedSeance.professeur}</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Salle</div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{selectedSeance.salle}</div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Horaire</div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                                {selectedSeance.jour} • {selectedSeance.heureDebut} - {selectedSeance.heureFin}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1.5px solid #e2e8f0',
                                background: 'white',
                                color: '#475569',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}>
                                <Edit2 size={16} />
                                Modifier
                            </button>
                            <button
                                onClick={() => handleDeleteSeance(selectedSeance.id)}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}>
                                <Trash2 size={16} />
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Planning Modal */}
            {showCreatePlanningModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(4px)'
                }}
                    onClick={() => setShowCreatePlanningModal(false)}
                >
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '28px',
                        width: '90%',
                        maxWidth: '480px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                                Créer un nouveau planning
                            </h2>
                            <button
                                onClick={() => setShowCreatePlanningModal(false)}
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

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const formData = new FormData(form);
                            handleCreatePlanning(formData.get('classe') as string, formData.get('semaine') as string);
                        }}>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Classe</label>
                                <select name="classe" required style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <option value="">Sélectionner une classe</option>
                                    {classes.filter(c => c !== 'Toutes les classes').map(classe => (
                                        <option key={classe} value={classe}>{classe}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Semaine</label>
                                <select name="semaine" required style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <option value="">Sélectionner une semaine</option>
                                    {semaines.map(semaine => (
                                        <option key={semaine.id} value={semaine.id}>{semaine.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreatePlanningModal(false)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        background: 'white',
                                        color: '#64748b',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Créer le planning
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Session Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(4px)'
                }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '28px',
                        width: '90%',
                        maxWidth: '480px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                                Ajouter une séance
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
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

                        <form onSubmit={handleAddSeance}>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Classe</label>
                                <select name="classe" required defaultValue={currentPlanning?.classe} style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <option value="">Sélectionner une classe</option>
                                    {classes.filter(c => c !== 'Toutes les classes').map(classe => (
                                        <option key={classe} value={classe}>{classe}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Cours</label>
                                <select name="cours" required style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <option value="">Sélectionner un cours</option>
                                    {modules.filter(m => m !== 'Tous les modules').map(module => (
                                        <option key={module} value={module}>{module}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Jour</label>
                                    <select name="jour" required style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}>
                                        {jours.map(jour => (
                                            <option key={jour} value={jour}>{jour}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Créneau</label>
                                    <select name="creneau" required style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}>
                                        {creneauxConfig.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Professeur</label>
                                <select name="professeur" required style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <option value="">Sélectionner un professeur</option>
                                    <option value="Baila WANE">Baila WANE</option>
                                    <option value="Aly TALL">Aly TALL</option>
                                    <option value="Olivier SAGNA">Olivier SAGNA</option>
                                    <option value="Serigne MBAYE">Serigne MBAYE</option>
                                    <option value="Moussa DIOP">Moussa DIOP</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Salle</label>
                                <input
                                    name="salle"
                                    type="text"
                                    required
                                    placeholder="Ex: Salle 101"
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        background: 'white',
                                        color: '#64748b',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Ajouter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
