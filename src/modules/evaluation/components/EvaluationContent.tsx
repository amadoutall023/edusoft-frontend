'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, X, Calendar, FileText, Edit, Trash2, ArrowLeft, ClipboardList, User, Clock, Loader2 } from 'lucide-react';
import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, Metadata, NoteStatus, SessionResponseDto, SessionType, UUID } from '@/shared/api/types';
import StatCard from './StatCard';
import EvaluationCard from './EvaluationCard';
import {
    fetchEvaluations,
    fetchEvaluationsStats,
    fetchClassesForFilter,
    createEvaluation,
    updateEvaluationStatus,
    fetchModulesForForm,
    fetchProfessorsForForm,
    fetchSallesForForm,
    CreateEvaluationPayload
} from '../services/evaluationService';
import { FiltreEvaluation, Evaluation, StatutEvaluation, StatistiqueEvaluation, ClasseOption, StatutNote } from '../types';
import { useRouter } from 'next/navigation';
import Pagination from '@/shared/components/Pagination';
import { UUID } from '@/shared/api/types';

export default function EvaluationContent() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [filtre, setFiltre] = useState<FiltreEvaluation>({
        statut: undefined,
        classe: 'Toutes les classes',
        statutNote: undefined
    });

    // États pour les données du backend
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [statistiques, setStatistiques] = useState<StatistiqueEvaluation[]>([]);
    const [classes, setClasses] = useState<ClasseOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalElements, setTotalElements] = useState(0);

    // États pour le formulaire d'ajout
    const [modules, setModules] = useState<{ id: UUID; libelle: string }[]>([]);
    const [professors, setProfessors] = useState<{ id: UUID; firstName: string; lastName: string }[]>([]);
    const [salles, setSalles] = useState<{ id: UUID; libelle: string }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // État pour le formulaire
    const [newEvaluation, setNewEvaluation] = useState<CreateEvaluationPayload>({
        libelle: '',
        date: '',
        startHour: '08:00',
        endHour: '10:00',
        typeSession: 'EVALUATION',
        modeSession: 'PRESENTIEL',
        moduleId: undefined,
        classeId: undefined,
        professorId: undefined,
        salleId: undefined
    });

    // Charger les données depuis le backend
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Charger les évaluations, les statistiques et les classes en parallèle
                const [evaluationsData, statsData, classesData] = await Promise.all([
                    fetchEvaluations({ page: 0, size: 500 }),
                    fetchEvaluationsStats(),
                    fetchClassesForFilter()
                ]);

                setEvaluations(evaluationsData.evaluations);
                setTotalElements(evaluationsData.metadata.totalElements);
                setStatistiques(statsData);
                setClasses(classesData);
            } catch (err) {
                console.error('Erreur lors du chargement des évaluations:', err);
                setError('Impossible de charger les évaluations. Veuillez réessayer plus tard.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const evaluationsFiltrees = useMemo(() => {
        // Retourner un tableau vide pendant le chargement pour éviter les problèmes de rendu
        if (loading) {
            return [];
        }

        console.log('Filter - Evaluations:', evaluations.length, 'Filtre:', JSON.stringify(filtre));

        return evaluations.filter(evaluation => {
            // Filtre par recherche
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const matchSearch =
                    evaluation.titre.toLowerCase().includes(search) ||
                    evaluation.classe.toLowerCase().includes(search) ||
                    evaluation.professeur.toLowerCase().includes(search);
                if (!matchSearch) return false;
            }

            // Filtre par classe
            const classeFilter = filtre.classe;
            if (classeFilter && classeFilter !== 'Toutes les classes') {
                // Gérer le cas où la classe de l'évaluation est "Classe non assignée"
                if (evaluation.classe === 'Classe non assignée') {
                    // Afficher ou non selon la préférence - ici on affiche
                } else if (evaluation.classe !== classeFilter) {
                    return false;
                }
            }

            // Filtre par statut
            if (filtre.statut) {
                if (evaluation.statut !== filtre.statut) return false;
            }

            // Filtre par statutNote
            if (filtre.statutNote) {
                if (evaluation.statutNote !== filtre.statutNote) return false;
            }

            return true;
        });
    }, [searchTerm, filtre, evaluations, loading]);

    const handleStatutClick = (statut: string) => {
        setFiltre(prev => ({
            ...prev,
            statut: prev.statut === statut ? undefined : statut
        }));
        setCurrentPage(1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filtre]);

    const totalPages = Math.ceil(evaluationsFiltrees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const evaluationsPaginees = evaluationsFiltrees.slice(startIndex, endIndex);

    console.log('Debug - Total:', evaluations.length, 'Filtrées:', evaluationsFiltrees.length, 'Affichées:', evaluationsPaginees.length);

    const handleStatutChange = async (evaluation: Evaluation, newStatut: StatutEvaluation) => {
        // Convertir le statut frontend en statut backend
        const backendStatus = newStatut === 'A venir' ? 'PROGRAMME' : 'TERMINEE';

        console.log('Changing status for evaluation:', evaluation.uuid, 'to:', backendStatus);

        try {
            const updated = await updateEvaluationStatus(evaluation.uuid, backendStatus);
            console.log('Status updated successfully:', updated);

            // Recharger les données pourrefléter le changement
            const data = await fetchEvaluations({ page: 0, size: 500 });
            setEvaluations(data.evaluations);

            // Recharger les statistiques
            const stats = await fetchEvaluationsStats();
            setStatistiques(stats);
        } catch (err) {
            console.error('Erreur lors de la mise à jour du statut:', err);
            setError('Impossible de mettre à jour le statut. Veuillez réessayer.');
        }
    };

    // Gérer le changement de statut des notes
    const handleNoteStatutChange = async (evaluation: Evaluation, newStatutNote: StatutNote) => {
        // Convertir le statutNote frontend en NoteStatus backend
        let backendNoteStatus: string;
        switch (newStatutNote) {
            case 'Note deposees':
                backendNoteStatus = 'DEPOSEE';
                break;
            case 'Note en retard':
                backendNoteStatus = 'EN_RETARD';
                break;
            default:
                backendNoteStatus = 'A_DEPOSER';
        }

        console.log('Changing note status for evaluation:', evaluation.uuid, 'to:', backendNoteStatus);

        try {
            const response = await httpClient<ApiResponse<SessionResponseDto>>(
                `/api/v1/sessions/${evaluation.uuid}/note-status`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ noteStatus: backendNoteStatus })
                }
            );

            console.log('Note status updated successfully:', response);

            // Recharger les données pour refléter le changement
            const evaluationsData = await fetchEvaluations({ page: 0, size: 500 });
            setEvaluations(evaluationsData.evaluations);

            // Recharger les statistiques
            const stats = await fetchEvaluationsStats();
            setStatistiques(stats);
        } catch (err) {
            console.error('Erreur lors de la mise à jour du statut des notes:', err);
            setError('Impossible de mettre à jour le statut des notes. Veuillez réessayer.');
        }
    };

    // Charger les données supplémentaires pour le formulaire
    const loadFormData = async () => {
        try {
            const [modulesData, professorsData, sallesData] = await Promise.all([
                fetchModulesForForm(),
                fetchProfessorsForForm(),
                fetchSallesForForm()
            ]);
            setModules(modulesData);
            setProfessors(professorsData);
            setSalles(sallesData);
        } catch (err) {
            console.error('Erreur lors du chargement des données du formulaire:', err);
        }
    };

    // Gérer l'ouverture du modal d'ajout
    const handleAjouterEvaluation = () => {
        loadFormData();
        setShowAddModal(true);
    };

    // Gérer l'affichage des détails d'une évaluation
    const handleVoirDetails = (evaluation: Evaluation) => {
        setSelectedEvaluation(evaluation);
    };

    // Gérer la soumission du formulaire
    const handleSubmitEvaluation = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        try {
            console.log('Submitting evaluation...');
            await createEvaluation(newEvaluation);
            console.log('Evaluation created successfully');

            // Recharger les données
            console.log('Reloading evaluations...');
            const evaluationsData = await fetchEvaluations({ page: 0, size: 500 });
            console.log('Evaluations reloaded:', evaluationsData.evaluations.length);

            console.log('Reloading stats...');
            const statsData = await fetchEvaluationsStats();
            console.log('Stats reloaded:', statsData);

            setEvaluations(evaluationsData.evaluations);
            setStatistiques(statsData);
            setShowAddModal(false);
            console.log('UI updated');

            // Réinitialiser le formulaire
            setNewEvaluation({
                libelle: '',
                date: '',
                startHour: '08:00',
                endHour: '10:00',
                typeSession: 'EVALUATION',
                modeSession: 'PRESENTIEL',
                moduleId: undefined,
                classeId: undefined,
                professorId: undefined,
                salleId: undefined
            });

            console.log('Form reset complete');
        } catch (err) {
            console.error('Erreur lors de la création de l\'évaluation:', err);
            setFormError('Impossible de créer l\'évaluation. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Page Title */}
            <div className="page-title" style={{
                padding: '32px 40px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
            }}>
                <button
                    onClick={() => router.push('/dashboard/cours-attache')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        background: 'white',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    title="Retour aux cours"
                >
                    <ArrowLeft size={20} color="#64748b" />
                </button>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a202c',
                    margin: 0,
                    letterSpacing: '-0.5px'
                }}>
                    Gestion des Évaluations
                </h1>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid" style={{
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                background: '#fafbfc',
                borderBottom: '1px solid #f1f5f9'
            }}>
                {statistiques.map((stat, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleStatutClick(stat.statut)}
                        style={{ cursor: 'pointer' }}
                    >
                        <StatCard stat={stat} />
                    </div>
                ))}
            </div>

            {/* Filters Section */}
            <div className="filters-section" style={{
                padding: '16px 24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                background: '#fafbfc',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '250px' }}>
                    <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Rechercher une évaluation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 42px',
                            borderRadius: '12px',
                            border: '1.5px solid #e5e7eb',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit',
                            background: 'white',
                            color: '#000000'
                        }}
                    />
                </div>

                {/* Class Filter */}
                <select
                    value={filtre.classe}
                    onChange={(e) => setFiltre(prev => ({ ...prev, classe: e.target.value }))}
                    style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #e5e7eb',
                        fontSize: '14px',
                        outline: 'none',
                        background: 'white',
                        color: '#4a5568',
                        fontWeight: '500',
                        cursor: 'pointer',
                        minWidth: '180px'
                    }}
                >
                    <option value="Toutes les classes">Toutes les classes</option>
                    {classes.map((classe) => (
                        <option key={classe.id} value={classe.libelle}>
                            {classe.libelle}
                        </option>
                    ))}
                </select>

                {/* Status Note Filter */}
                <select
                    value={filtre.statutNote || ''}
                    onChange={(e) => setFiltre(prev => ({ ...prev, statutNote: e.target.value || undefined }))}
                    style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #e5e7eb',
                        fontSize: '14px',
                        outline: 'none',
                        background: 'white',
                        color: '#4a5568',
                        fontWeight: '500',
                        cursor: 'pointer',
                        minWidth: '180px'
                    }}
                >
                    <option value="">Tous statuts notes</option>
                    <option value="A deposer">À déposer</option>
                    <option value="Note deposees">Déposées</option>
                    <option value="Note en retard">En retard</option>
                </select>

                {/* Reset Filters */}
                {(searchTerm || filtre.statut || (filtre.classe && filtre.classe !== 'Toutes les classes') || filtre.statutNote) && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFiltre({ statut: undefined, classe: 'Toutes les classes', statutNote: undefined });
                        }}
                        style={{
                            padding: '12px 20px',
                            background: 'white',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: '12px',
                            color: '#64748b',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Réinitialiser
                    </button>
                )}

                <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    {evaluationsFiltrees.length > 0
                        ? `${startIndex + 1}-${Math.min(endIndex, evaluationsFiltrees.length)} sur ${evaluationsFiltrees.length} évaluation(s)`
                        : `0 évaluation`
                    }
                </div>

                {/* Add Evaluation Button */}
                <button
                    onClick={handleAjouterEvaluation}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                    }}
                >
                    <Plus size={18} />
                    <span className="add-button">Ajouter évaluation</span>
                </button>
            </div>

            {/* Evaluations Grid */}
            <div className="evaluations-grid" style={{ padding: '24px' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <Loader2 size={48} style={{ marginBottom: '16px', color: '#94a3b8', animation: 'spin 1s linear infinite' }} className="animate-spin" />
                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#64748b' }}>
                            Chargement des évaluations...
                        </div>
                    </div>
                ) : error ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>
                            {error}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '12px 24px',
                                background: '#5B8DEF',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginTop: '16px'
                            }}
                        >
                            Réessayer
                        </button>
                    </div>
                ) : evaluationsPaginees.length > 0 ? (
                    <div className="eval-cards" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                        {evaluationsPaginees.map(evaluation => (
                            <EvaluationCard
                                key={evaluation.id}
                                evaluation={evaluation}
                                onVoirDetails={() => handleVoirDetails(evaluation)}
                                onStatutChange={handleStatutChange}
                                onNoteStatutChange={handleNoteStatutChange}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <ClipboardList size={48} style={{ marginBottom: '16px', color: '#94a3b8' }} />
                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#64748b' }}>
                            Aucune évaluation trouvée
                        </div>
                        <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                            Essayez de modifier vos filtres de recherche
                        </div>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Modal Details */}
            {selectedEvaluation && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                                Détails de l'évaluation
                            </h2>
                            <button
                                onClick={() => setSelectedEvaluation(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={24} color="#64748b" />
                            </button>
                        </div>

                        {/* Evaluation Info */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', marginBottom: '8px' }}>
                                    {selectedEvaluation.titre}
                                </h3>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        background: selectedEvaluation.statut === 'A venir' ? '#dbeafe' :
                                            selectedEvaluation.statut === 'Passées' ? '#f1f5f9' :
                                                selectedEvaluation.statut === 'Note deposees' ? '#d1fae5' : '#fee2e2',
                                        color: selectedEvaluation.statut === 'A venir' ? '#2563eb' :
                                            selectedEvaluation.statut === 'Passées' ? '#475569' :
                                                selectedEvaluation.statut === 'Note deposees' ? '#059669' : '#dc2626'
                                    }}>
                                        {selectedEvaluation.statut}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: '#f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Calendar size={20} color="#64748b" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Date de dépôt</div>
                                        <div style={{ fontSize: '14px', color: '#1a202c', fontWeight: '600' }}>{selectedEvaluation.dateDepot}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: '#f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FileText size={20} color="#64748b" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Classe</div>
                                        <div style={{ fontSize: '14px', color: '#1a202c', fontWeight: '600' }}>{selectedEvaluation.classe}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: '#f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <User size={20} color="#64748b" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Professeur</div>
                                        <div style={{ fontSize: '14px', color: '#1a202c', fontWeight: '600' }}>{selectedEvaluation.professeur}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Fichiers déposés */}
                            {selectedEvaluation.fichiersDeposes && selectedEvaluation.fichiersDeposes.length > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                                        <Clock size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                                        Fichiers déposés ({selectedEvaluation.fichiersDeposes.length})
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedEvaluation.fichiersDeposes.map((fichier, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px',
                                                background: '#f8fafc',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                <FileText size={18} color="#64748b" />
                                                <span style={{ fontSize: '14px', color: '#1a202c', fontWeight: '500' }}>{fichier}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSelectedEvaluation(null)}
                                style={{
                                    padding: '12px 24px',
                                    background: 'white',
                                    border: '1.5px solid #e5e7eb',
                                    borderRadius: '10px',
                                    color: '#64748b',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Fermer
                            </button>
                            <button
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: '#5B8DEF',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Edit size={18} />
                                Modifier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                                Ajouter une évaluation
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={24} color="#64748b" />
                            </button>
                        </div>

                        {/* Form */}
                        <form id="evaluation-form" onSubmit={handleSubmitEvaluation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {formError && (
                                <div style={{
                                    padding: '12px 16px',
                                    background: '#fee2e2',
                                    borderRadius: '8px',
                                    color: '#dc2626',
                                    fontSize: '14px'
                                }}>
                                    {formError}
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                                    Titre de l'évaluation *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Devoir surveiller - Algorithmique"
                                    value={newEvaluation.libelle}
                                    onChange={(e) => setNewEvaluation(prev => ({ ...prev, libelle: e.target.value }))}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e5e7eb',
                                        fontSize: '14px',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        background: 'white',
                                        color: '#000000'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                                    Module
                                </label>
                                <select
                                    value={newEvaluation.moduleId || ''}
                                    onChange={(e) => setNewEvaluation(prev => ({ ...prev, moduleId: e.target.value as UUID || undefined }))}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e5e7eb',
                                        fontSize: '14px',
                                        outline: 'none',
                                        background: 'white',
                                        color: '#4a5568',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Sélectionner un module</option>
                                    {modules.map((module) => (
                                        <option key={module.id} value={module.id}>
                                            {module.libelle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                                    Classe
                                </label>
                                <select
                                    value={newEvaluation.classeId || ''}
                                    onChange={(e) => setNewEvaluation(prev => ({ ...prev, classeId: e.target.value as UUID || undefined }))}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e5e7eb',
                                        fontSize: '14px',
                                        outline: 'none',
                                        background: 'white',
                                        color: '#4a5568',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Sélectionner une classe</option>
                                    {classes.map((classe) => (
                                        <option key={classe.id} value={classe.id}>
                                            {classe.libelle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                                    Professeur
                                </label>
                                <select
                                    value={newEvaluation.professorId || ''}
                                    onChange={(e) => setNewEvaluation(prev => ({ ...prev, professorId: e.target.value as UUID || undefined }))}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e5e7eb',
                                        fontSize: '14px',
                                        outline: 'none',
                                        background: 'white',
                                        color: '#4a5568',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Sélectionner un professeur</option>
                                    {professors.map((prof) => (
                                        <option key={prof.id} value={prof.id}>
                                            {prof.firstName} {prof.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                                    Salle
                                </label>
                                <select
                                    value={newEvaluation.salleId || ''}
                                    onChange={(e) => setNewEvaluation(prev => ({ ...prev, salleId: e.target.value as UUID || undefined }))}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e5e7eb',
                                        fontSize: '14px',
                                        outline: 'none',
                                        background: 'white',
                                        color: '#4a5568',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Sélectionner une salle</option>
                                    {salles.map((salle) => (
                                        <option key={salle.id} value={salle.id}>
                                            {salle.libelle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={newEvaluation.date}
                                        onChange={(e) => setNewEvaluation(prev => ({ ...prev, date: e.target.value }))}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '1.5px solid #e5e7eb',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            background: 'white',
                                            color: '#000000'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                                        Mode
                                    </label>
                                    <select
                                        value={newEvaluation.modeSession}
                                        onChange={(e) => setNewEvaluation(prev => ({ ...prev, modeSession: e.target.value as 'PRESENTIEL' | 'EN_LIGNE' | 'HYBRIDE' }))}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '1.5px solid #e5e7eb',
                                            fontSize: '14px',
                                            outline: 'none',
                                            background: 'white',
                                            color: '#4a5568',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="PRESENTIEL">Présentiel</option>
                                        <option value="EN_LIGNE">En ligne</option>
                                        <option value="HYBRIDE">Hybride</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                                        Heure de début
                                    </label>
                                    <input
                                        type="time"
                                        value={newEvaluation.startHour}
                                        onChange={(e) => setNewEvaluation(prev => ({ ...prev, startHour: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '1.5px solid #e5e7eb',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            background: 'white',
                                            color: '#000000'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                                        Heure de fin
                                    </label>
                                    <input
                                        type="time"
                                        value={newEvaluation.endHour}
                                        onChange={(e) => setNewEvaluation(prev => ({ ...prev, endHour: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '1.5px solid #e5e7eb',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            background: 'white',
                                            color: '#000000'
                                        }}
                                    />
                                </div>
                            </div>
                        </form>

                        {/* Modal Actions */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                disabled={submitting}
                                style={{
                                    padding: '12px 24px',
                                    background: 'white',
                                    border: '1.5px solid #e5e7eb',
                                    borderRadius: '10px',
                                    color: '#64748b',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: submitting ? 0.7 : 1
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                form="evaluation-form"
                                disabled={submitting}
                                style={{
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: submitting ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {submitting && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                                {submitting ? 'Création...' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                /* Mobile First - Styles de base */
                .page-title {
                    padding: 20px 16px 16px !important;
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 12px !important;
                }
                
                .page-title h1 {
                    font-size: 20px !important;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                    padding: 16px !important;
                    gap: 12px !important;
                }
                
                .filters-section {
                    flex-wrap: wrap !important;
                    padding: 12px 16px !important;
                    gap: 8px !important;
                }
                
                .filters-section > div:first-child {
                    flex: 1 1 100% !important;
                    min-width: 100% !important;
                }
                
                .filters-section select,
                .filters-section button {
                    flex: 1 1 calc(50% - 4px) !important;
                    min-width: calc(50% - 4px) !important;
                }
                
                .add-button {
                    flex: 1 1 100% !important;
                    justify-content: center !important;
                }
                
                .evaluations-grid {
                    grid-template-columns: 1fr !important;
                    padding: 16px !important;
                    gap: 12px !important;
                }
                
                /* Tablette */
                @media (min-width: 768px) {
                    .page-title {
                        padding: 24px 24px 20px !important;
                        flex-direction: row !important;
                        align-items: center !important;
                        gap: 16px !important;
                    }
                    
                    .page-title h1 {
                        font-size: 24px !important;
                    }
                    
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        padding: 20px !important;
                    }
                    
                    .filters-section {
                        flex-wrap: nowrap !important;
                    }
                    
                    .filters-section > div:first-child {
                        flex: 1 1 250px !important;
                        min-width: 200px !important;
                    }
                    
                    .filters-section select,
                    .filters-section button {
                        flex: 0 0 auto !important;
                        min-width: auto !important;
                    }
                    
                    .add-button {
                        flex: 0 0 auto !important;
                    }
                    
                    .evaluations-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        padding: 20px !important;
                    }
                    
                    .eval-cards {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                
                /* Desktop */
                @media (min-width: 1200px) {
                    .page-title {
                        padding: 32px 40px 24px !important;
                    }
                    
                    .page-title h1 {
                        font-size: 28px !important;
                    }
                    
                    .stats-grid {
                        grid-template-columns: repeat(4, 1fr) !important;
                        padding: 24px !important;
                    }
                    
                    .filters-section {
                        padding: 16px 24px !important;
                    }
                    
                    .evaluations-grid {
                        padding: 24px !important;
                    }
                }
                
                /* Modal responsive */
                .modal-content {
                    margin: 16px !important;
                    padding: 20px !important;
                    max-height: calc(100vh - 32px) !important;
                }
                
                @media (min-width: 768px) {
                    .modal-content {
                        margin: 24px !important;
                        padding: 24px !important;
                    }
                }
              `}</style>
            <style jsx global>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </>
    );
}

