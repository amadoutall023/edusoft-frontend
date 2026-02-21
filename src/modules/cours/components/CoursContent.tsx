'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, X, Archive } from 'lucide-react';
import CoursCard from './CoursCard';
import Pagination from '@/shared/components/Pagination';
import { Cours, FiltreCours } from '../types';
import { fetchCourses, createCourse } from '../services/coursService';
import { CoursResponseDto, ClasseResponseDto, ModuleResponseDto, ProfessorResponseDto } from '@/shared/api/types';
import { fetchClasses, fetchModules } from '@/modules/structure/services/structureService';
import { fetchProfessors } from '@/modules/prof/services/professorService';
import { ApiError } from '@/shared/errors/ApiError';

const mapCoursDto = (cours: CoursResponseDto): Cours => {
    const total = cours.totalHour ?? 0;
    const completed = cours.completedHour ?? 0;
    const planned = cours.plannedHour ?? 0;
    const progression = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

    return {
        id: cours.id,
        titre: cours.libelle,
        niveau: cours.classes?.map(classe => classe.libelle).join(' / ') ?? '—',
        filiere: cours.module?.libelle ?? undefined,
        professeur: cours.professor
            ? `${cours.professor.prenom ?? ''} ${cours.professor.nom ?? ''}`.trim() || 'Non assigné'
            : 'Non assigné',
        volumeHoraire: total,
        heuresPlanifie: planned,
        heuresFaites: completed,
        heuresRestantes: Math.max(0, total - completed),
        progression,
        classes: cours.classes?.map(classe => classe.libelle) ?? [],
        module: cours.module?.libelle ?? null
    };
};

const INITIAL_COURSE_FORM = {
    titre: '',
    moduleId: '',
    classeId: '',
    professeurId: '',
    volumeHoraire: 0,
    heuresPlanifie: 0
};

export default function CoursContent() {
    const [courses, setCourses] = useState<Cours[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtres, setFiltres] = useState<FiltreCours>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showArchive, setShowArchive] = useState(false);
    const [archivedCours, setArchivedCours] = useState<string[]>([]);
    const [newCours, setNewCours] = useState({ ...INITIAL_COURSE_FORM });
    const [availableClasses, setAvailableClasses] = useState<ClasseResponseDto[]>([]);
    const [availableModules, setAvailableModules] = useState<ModuleResponseDto[]>([]);
    const [availableProfessors, setAvailableProfessors] = useState<ProfessorResponseDto[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const itemsPerPage = 4;

    const handleArchive = (id: string) => {
        setArchivedCours((prev) => [...prev, id]);
        console.log('Cours archivé:', id);
    };

    const handleUnarchive = (id: string) => {
        setArchivedCours((prev) => prev.filter(c => c !== id));
        console.log('Cours désarchivé:', id);
    };

    useEffect(() => {
        let isMounted = true;

        const loadCourses = async () => {
            try {
                setIsLoading(true);
                const [apiCourses, classes, modules, professors] = await Promise.all([
                    fetchCourses(),
                    fetchClasses(200),
                    fetchModules(200),
                    fetchProfessors()
                ]);
                if (!isMounted) return;
                setCourses(apiCourses.map(mapCoursDto));
                setAvailableClasses(classes);
                setAvailableModules(modules);
                setAvailableProfessors(professors);
                setError(null);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof ApiError ? err.message : 'Impossible de charger les cours.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadCourses();

        return () => {
            isMounted = false;
        };
    }, []);

    // Extraire les valeurs uniques pour les filtres
    const niveaux = useMemo(() => {
        const niveauxSet = new Set<string>();
        courses.forEach(cours => {
            cours.niveau.split('/').map(n => n.trim()).forEach(n => niveauxSet.add(n));
        });
        return Array.from(niveauxSet).sort();
    }, [courses]);

    const filières = useMemo(() => {
        const filieresSet = new Set<string>();
        courses.forEach(cours => {
            if (cours.filiere) {
                filieresSet.add(cours.filiere);
            }
        });
        return Array.from(filieresSet).sort();
    }, [courses]);

    const professeurs = useMemo(() => {
        const profsSet = new Set(courses.map(c => c.professeur));
        return Array.from(profsSet).sort();
    }, [courses]);

    const coursFiltres = useMemo(() => {
        const availableCours = showArchive
            ? courses.filter(cours => archivedCours.includes(cours.id))
            : courses.filter(cours => !archivedCours.includes(cours.id));

        return availableCours.filter(cours => {
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const matchSearch =
                    cours.titre.toLowerCase().includes(search) ||
                    cours.niveau.toLowerCase().includes(search) ||
                    cours.professeur.toLowerCase().includes(search);
                if (!matchSearch) return false;
            }

            if (filtres.niveau) {
                if (!cours.niveau.includes(filtres.niveau)) return false;
            }

            if (filtres.filiere) {
                if ((cours.filiere ?? '').toLowerCase() !== filtres.filiere.toLowerCase()) return false;
            }

            if (filtres.professeur) {
                if (cours.professeur !== filtres.professeur) return false;
            }

            return true;
        });
    }, [searchTerm, filtres, archivedCours, showArchive, courses]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filtres]);

    const totalPages = Math.ceil(coursFiltres.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const coursPagines = coursFiltres.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCours.moduleId || !newCours.classeId) {
            alert('Merci de sélectionner un module et une classe.');
            return;
        }

        try {
            setIsCreating(true);
            await createCourse({
                libelle: newCours.titre,
                totalHour: newCours.volumeHoraire,
                plannedHour: newCours.heuresPlanifie,
                moduleId: newCours.moduleId,
                classIds: [newCours.classeId],
                professorId: newCours.professeurId || undefined
            });
            const refreshed = await fetchCourses();
            setCourses(refreshed.map(mapCoursDto));
            setShowModal(false);
            setNewCours({ ...INITIAL_COURSE_FORM });
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Impossible de créer le cours.';
            alert(message);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            {/* Page Title */}
            <div className="page-title" style={{
                padding: '32px 40px 24px',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a202c',
                    margin: 0,
                    letterSpacing: '-0.5px'
                }}>
                    {showArchive ? 'Cours archivés' : 'Gestion des cours'}
                </h1>
            </div>

            {/* Search Section */}
            <div className="search-section" style={{
                padding: '16px 24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                background: '#fafbfc',
                borderBottom: '1px solid #f1f5f9',
                flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '250px' }}>
                    <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Rechercher"
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

                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 18px',
                    background: 'white',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '12px',
                    color: '#4a5568',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                }}>
                    <Filter size={16} strokeWidth={2.5} />
                </button>

                <button onClick={() => setShowArchive(!showArchive)} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: showArchive ? '#5B8DEF' : 'white',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '12px',
                    color: showArchive ? 'white' : '#4a5568',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap'
                }}>
                    <Archive size={18} />
                    {showArchive ? 'Liste active' : 'Listes archive'}
                </button>

                <button onClick={() => setShowModal(true)} style={{
                    display: showArchive ? 'none' : 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: '#5B8DEF',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap'
                }}>
                    <Plus size={18} />
                    Ajouter cours
                </button>
            </div>

            {/* Filters Section */}
            <div className="filters-section" style={{
                padding: '12px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Filtrer par:</span>

                <select
                    value={filtres.niveau || ''}
                    onChange={(e) => setFiltres({ ...filtres, niveau: e.target.value || undefined })}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #e5e7eb',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#475569',
                        background: 'white',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        minWidth: '120px'
                    }}
                >
                    <option value="">Tous les niveaux</option>
                    {niveaux.map(niveau => (
                        <option key={niveau} value={niveau}>{niveau}</option>
                    ))}
                </select>

                <select
                    value={filtres.filiere || ''}
                    onChange={(e) => setFiltres({ ...filtres, filiere: e.target.value || undefined })}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #e5e7eb',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#475569',
                        background: 'white',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        minWidth: '120px'
                    }}
                >
                    <option value="">Toutes les filières</option>
                    {filières.map(filiere => (
                        <option key={filiere} value={filiere}>{filiere}</option>
                    ))}
                </select>

                <select
                    value={filtres.professeur || ''}
                    onChange={(e) => setFiltres({ ...filtres, professeur: e.target.value || undefined })}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #e5e7eb',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#475569',
                        background: 'white',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        minWidth: '150px'
                    }}
                >
                    <option value="">Tous les professeurs</option>
                    {professeurs.map(prof => (
                        <option key={prof} value={prof}>{prof}</option>
                    ))}
                </select>

                {(filtres.niveau || filtres.filiere || filtres.professeur) && (
                    <button
                        onClick={() => setFiltres({})}
                        style={{
                            padding: '8px 16px',
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#64748b',
                            cursor: 'pointer',
                            fontFamily: 'inherit'
                        }}
                    >
                        Réinitialiser
                    </button>
                )}

                <div className="results-count" style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    {coursFiltres.length > 0
                        ? `${startIndex + 1}-${Math.min(endIndex, coursFiltres.length)} sur ${coursFiltres.length} cours`
                        : `0 cours`
                    }
                </div>
            </div>

            {error && (
                <div style={{ padding: '16px 40px', color: '#dc2626' }}>
                    {error}
                </div>
            )}

            {isLoading && (
                <div style={{ padding: '16px 40px', color: '#64748b' }}>
                    Chargement des cours...
                </div>
            )}

            {/* Cards Container */}
            <div className="cards-container" style={{ padding: '16px' }}>
                {!isLoading && coursPagines.length > 0 ? (
                    <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        {coursPagines.map(cours => (
                            <CoursCard
                                key={cours.id}
                                cours={cours}
                                onArchive={showArchive ? handleUnarchive : handleArchive}
                                isArchiveView={showArchive}
                            />
                        ))}
                    </div>
                ) : !isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#64748b' }}>
                            {showArchive ? 'Aucun cours archivé' : 'Aucun cours trouvé'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#94a3b8' }}>Essayez de modifier vos filtres de recherche</div>
                    </div>
                ) : null}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Modal for adding new cours */}
            {showModal && (
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
                    zIndex: 9999
                }}
                    onClick={() => setShowModal(false)}
                >
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '32px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
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
                            marginBottom: '24px'
                        }}>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: '700',
                                color: '#1a202c',
                                margin: 0
                            }}>Créer un cours</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: '#f1f5f9',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Titre du cours</label>
                                <input
                                    type="text"
                                    value={newCours.titre}
                                    onChange={(e) => setNewCours({ ...newCours, titre: e.target.value })}
                                    placeholder="Ex: Algorithmique"
                                    required
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

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Module</label>
                                <select
                                    value={newCours.moduleId}
                                    onChange={(e) => setNewCours({ ...newCours, moduleId: e.target.value })}
                                    required
                                    style={{
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
                                    }}
                                >
                                    <option value="">Sélectionner un module</option>
                                    {availableModules.map(module => (
                                        <option key={module.id} value={module.id}>{module.libelle}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Classe</label>
                                <select
                                    value={newCours.classeId}
                                    onChange={(e) => setNewCours({ ...newCours, classeId: e.target.value })}
                                    required
                                    style={{
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
                                    }}
                                >
                                    <option value="">Sélectionner une classe</option>
                                    {availableClasses.map(classe => (
                                        <option key={classe.id} value={classe.id}>{classe.libelle}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Professeur</label>
                                <select
                                    value={newCours.professeurId}
                                    onChange={(e) => setNewCours({ ...newCours, professeurId: e.target.value })}
                                    required
                                    style={{
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
                                    }}
                                >
                                    <option value="">Sélectionner un professeur</option>
                                    {availableProfessors.map(prof => (
                                        <option key={prof.professorId} value={prof.professorId}>
                                            {prof.firstName} {prof.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Volume horaire</label>
                                <input
                                    type="number"
                                    value={newCours.volumeHoraire || ''}
                                    onChange={(e) => setNewCours({ ...newCours, volumeHoraire: parseInt(e.target.value) || 0 })}
                                    placeholder="Ex: 30"
                                    required
                                    min="0"
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#4a5568',
                                        marginBottom: '8px'
                                    }}>Heures planifiées</label>
                                    <input
                                        type="number"
                                        value={newCours.heuresPlanifie || ''}
                                        onChange={(e) => setNewCours({ ...newCours, heuresPlanifie: parseInt(e.target.value) || 0 })}
                                        placeholder="Ex: 20"
                                        required
                                        min="0"
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
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#4a5568',
                                        marginBottom: '8px'
                                    }}>Heures faites</label>
                                    <input
                                        type="number"
                                        value={0}
                                        disabled
                                        placeholder="Calcul automatique"
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
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#4a5568',
                                        marginBottom: '8px'
                                    }}>Heures restantes</label>
                                    <input
                                        type="number"
                                        value={Math.max(0, newCours.volumeHoraire - newCours.heuresPlanifie) || 0}
                                        disabled
                                        placeholder="Calcul automatique"
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
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        background: 'white',
                                        color: '#64748b',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    style={{
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
                                    }}
                                >
                                    {isCreating ? 'Création...' : 'Créer le cours'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    .page-title {
                        padding: 20px !important;
                    }
                    .page-title h1 {
                        font-size: 22px !important;
                    }
                    .search-section {
                        padding: 12px 20px !important;
                    }
                    .filters-section {
                        padding: 12px 20px !important;
                    }
                    .cards-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .results-count {
                        width: 100%;
                        margin-left: 0 !important;
                        margin-top: 8px;
                    }
                }
            `}</style>
        </>
    );
}
