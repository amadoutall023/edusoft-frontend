'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Search,
    Plus,
    ChevronDown,
    X,
    GripVertical,
    Trash2,
    Edit2,
    Calendar,
    Layers,
    RotateCw
} from 'lucide-react';
import {
    ClasseResponseDto,
    CoursResponseDto,
    Metadata,
    ModuleResponseDto,
    ProfessorResponseDto,
    SalleResponseDto,
    SessionRequestDto,
    SessionResponseDto,
    SessionStatus
} from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';
import { PlanningSemaine, SeancePlanning, JourSemaine } from '../types';
import { JOUR_OPTIONS, STATUS_COLOR, TIME_SLOTS } from '../constants';
import {
    fetchSessions,
    createSession,
    updateSession,
    deleteSession
} from '../services/sessionService';
import {
    fetchClasses,
    fetchModules,
    fetchSalles
} from '@/modules/structure/services/structureService';
import { fetchCourses } from '@/modules/cours/services/coursService';
import { fetchProfessors } from '@/modules/prof/services/professorService';

const ALL_CLASSES = 'ALL_CLASSES';
const ALL_MODULES = 'ALL_MODULES';

interface WeekOption {
    id: string;
    label: string;
    debut: string;
    fin: string;
}

const DAY_INDEX: Record<JourSemaine, number> = {
    Lundi: 0,
    Mardi: 1,
    Mercredi: 2,
    Jeudi: 3,
    Vendredi: 4,
    Samedi: 5
};

interface SessionFormState {
    classeId: string;
    coursId: string;
    jour: JourSemaine;
    creneau: string;
    professeurId: string;
    salleInput: string;
}

function createFormState(overrides: Partial<SessionFormState> = {}): SessionFormState {
    return {
        classeId: '',
        coursId: '',
        jour: JOUR_OPTIONS[0],
        creneau: TIME_SLOTS[0].id,
        professeurId: '',
        salleInput: '',
        ...overrides
    };
}

function startOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(date);
    start.setDate(date.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
}

function formatWeekLabel(start: Date, end: Date) {
    const format = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    return `Semaine du ${format(start)} au ${format(end)}`;
}

function buildWeekOption(dateISO: string): WeekOption {
    const date = new Date(dateISO);
    const monday = startOfWeek(date);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return {
        id: monday.toISOString().split('T')[0],
        label: formatWeekLabel(monday, friday),
        debut: monday.toISOString().split('T')[0],
        fin: friday.toISOString().split('T')[0]
    };
}

function generateRollingWeeks(count = 6): WeekOption[] {
    const weeks: WeekOption[] = [];
    const today = new Date();
    for (let i = -1; i < count; i++) {
        const ref = new Date(today);
        ref.setDate(ref.getDate() + i * 7);
        weeks.push(buildWeekOption(ref.toISOString()));
    }
    const dedup = new Map(weeks.map(week => [week.id, week]));
    return Array.from(dedup.values()).sort((a, b) => a.debut.localeCompare(b.debut));
}

function formatHourDisplay(time?: string | null) {
    if (!time) return '--';
    const [hour, minute] = time.split(':');
    return `${hour}H${minute !== '00' ? `:${minute}` : ''}`;
}

function computeColor(status?: SessionStatus | null) {
    if (!status) return STATUS_COLOR.DEFAULT;
    return STATUS_COLOR[status] ?? STATUS_COLOR.DEFAULT;
}

function normalizeJour(dateISO: string): JourSemaine {
    const formatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' });
    const label = formatter.format(new Date(dateISO));
    const formatted = (label.charAt(0).toUpperCase() + label.slice(1)).split('-')[0];
    if (JOUR_OPTIONS.includes(formatted as JourSemaine)) {
        return formatted as JourSemaine;
    }
    return 'Lundi';
}

function dateFromWeekAndDay(weekStart: string, jour: JourSemaine) {
    const start = new Date(weekStart);
    start.setDate(start.getDate() + DAY_INDEX[jour]);
    return start.toISOString().split('T')[0];
}

function isWithinWeek(dateISO: string, week: WeekOption) {
    return dateISO >= week.debut && dateISO <= week.fin;
}

function mapSessionToSeance(session: SessionResponseDto): SeancePlanning {
    const jour = normalizeJour(session.date);
    return {
        id: session.id,
        classe: session.classe?.libelle ?? session.classes?.[0]?.libelle ?? 'Classe',
        classeId: session.classe?.id ?? session.classes?.[0]?.id ?? null,
        cours: session.cours?.libelle ?? session.libelle,
        coursId: session.cours?.id ?? null,
        moduleId: session.module?.id ?? null,
        moduleLibelle: session.module?.libelle ?? null,
        professeur: session.professor
            ? `${session.professor.prenom ?? ''} ${session.professor.nom ?? ''}`.trim() || 'Non assigné'
            : 'Non assigné',
        professeurId: session.professor?.id ?? null,
        salle: session.salle?.libelle ?? 'Salle',
        salleId: session.salle?.id ?? null,
        jour,
        dateISO: session.date,
        heureDebut: formatHourDisplay(session.startHour),
        heureFin: formatHourDisplay(session.endHour),
        couleur: computeColor(session.status),
        status: session.status,
        typeSession: session.typeSession,
        modeSession: session.modeSession
    };
}

function buildSessionPayload(
    session: SessionResponseDto,
    overrides: Partial<SessionRequestDto> = {}
): SessionRequestDto {
    return {
        date: overrides.date ?? session.date,
        startHour: overrides.startHour ?? session.startHour,
        endHour: overrides.endHour ?? session.endHour,
        duration: overrides.duration ?? (session.duration ?? null),
        typeSession: overrides.typeSession ?? session.typeSession,
        modeSession: overrides.modeSession ?? session.modeSession,
        status: overrides.status ?? session.status ?? null,
        libelle: overrides.libelle ?? session.libelle,
        sessionSummary: overrides.sessionSummary ?? session.sessionSummary ?? null,
        coursId: overrides.coursId ?? session.cours?.id ?? null,
        moduleId: overrides.moduleId ?? session.module?.id ?? null,
        classeId: overrides.classeId ?? session.classe?.id ?? null,
        classIds: overrides.classIds ?? (session.classes ? session.classes.map(classe => classe.id) : null),
        professorId: overrides.professorId ?? session.professor?.id ?? null,
        salleId: overrides.salleId ?? session.salle?.id ?? null,
    };
}

function buildSlotId(startHour?: string | null, endHour?: string | null) {
    const start = (startHour ?? '').slice(0, 5);
    const end = (endHour ?? '').slice(0, 5);
    const candidate = `${start}-${end}`;
    return TIME_SLOTS.some(slot => slot.id === candidate) ? candidate : TIME_SLOTS[0].id;
}

export default function PlanningContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState(ALL_MODULES);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCreatePlanningModal, setShowCreatePlanningModal] = useState(false);
    const [selectedSeance, setSelectedSeance] = useState<SeancePlanning | null>(null);
    const [draggedSeance, setDraggedSeance] = useState<SeancePlanning | null>(null);
    const [selectedClasse, setSelectedClasse] = useState<string>(ALL_CLASSES);
    const [selectedSemaine, setSelectedSemaine] = useState<string>('');
    const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('vertical');
    const [sessions, setSessions] = useState<SessionResponseDto[]>([]);
    const [classes, setClasses] = useState<ClasseResponseDto[]>([]);
    const [modules, setModules] = useState<ModuleResponseDto[]>([]);
    const [courses, setCourses] = useState<CoursResponseDto[]>([]);
    const [professors, setProfessors] = useState<ProfessorResponseDto[]>([]);
    const [salles, setSalles] = useState<SalleResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMutating, setIsMutating] = useState(false);
    const [formState, setFormState] = useState<SessionFormState>(() => createFormState());
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editingWeekStart, setEditingWeekStart] = useState<string | null>(null);
    const [sessionMeta, setSessionMeta] = useState<Metadata | null>(null);
    const [hasMoreSessions, setHasMoreSessions] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const sessionPageSize = 100;

    const loadSessionsPage = useCallback(async (page = 0, append = false) => {
        const result = await fetchSessions({ size: sessionPageSize, page });
        setSessions(prev => {
            if (!append) {
                return result.data;
            }
            const existingIds = new Set(prev.map(session => session.id));
            const merged = [...prev];
            result.data.forEach(session => {
                if (!existingIds.has(session.id)) {
                    merged.push(session);
                }
            });
            return merged;
        });
        const meta = result.meta ?? null;
        setSessionMeta(meta);
        const currentPage = meta?.page ?? page;
        setHasMoreSessions(meta ? currentPage + 1 < meta.totalPages : false);
        return result;
    }, [sessionPageSize]);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setSessionMeta(null);
            setHasMoreSessions(false);
            const [
                classesRes,
                modulesRes,
                coursesRes,
                professorsRes,
                sallesRes
            ] = await Promise.all([
                fetchClasses(200),
                fetchModules(200),
                fetchCourses({ size: 200 }),
                fetchProfessors(),
                fetchSalles(200)
            ]);
            setClasses(classesRes);
            setModules(modulesRes);
            setCourses(coursesRes);
            setProfessors(professorsRes);
            setSalles(sallesRes);
            await loadSessionsPage(0, false);
            setError(null);
        } catch (err) {
            console.error('Unable to load planning data', err);
            setError(err instanceof ApiError ? err.message : 'Impossible de charger le planning.');
        } finally {
            setIsLoading(false);
        }
    }, [loadSessionsPage]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const sessionMap = useMemo(() => {
        const entries = new Map<string, SessionResponseDto>();
        sessions.forEach(session => {
            entries.set(session.id, session);
        });
        return entries;
    }, [sessions]);

    const seances = useMemo(() => sessions.map(mapSessionToSeance), [sessions]);

    const classOptions = useMemo(
        () => [
            { id: ALL_CLASSES, label: 'Toutes les classes' },
            ...classes
                .slice()
                .sort((a, b) => a.libelle.localeCompare(b.libelle))
                .map(classe => ({ id: classe.id, label: classe.libelle }))
        ],
        [classes]
    );

    const moduleOptions = useMemo(
        () => [
            { id: ALL_MODULES, label: 'Tous les modules' },
            ...modules
                .slice()
                .sort((a, b) => a.libelle.localeCompare(b.libelle))
                .map(module => ({ id: module.id, label: module.libelle }))
        ],
        [modules]
    );

    const weekOptions = useMemo(() => {
        const weeks = new Map<string, WeekOption>();
        sessions.forEach(session => {
            const option = buildWeekOption(session.date);
            weeks.set(option.id, option);
        });
        generateRollingWeeks().forEach(option => weeks.set(option.id, option));
        return Array.from(weeks.values()).sort((a, b) => a.debut.localeCompare(b.debut));
    }, [sessions]);

    const weekMap = useMemo(() => {
        const map = new Map<string, WeekOption>();
        weekOptions.forEach(option => map.set(option.id, option));
        return map;
    }, [weekOptions]);

    useEffect(() => {
        if (selectedSemaine && !weekMap.has(selectedSemaine)) {
            setSelectedSemaine('');
        }
    }, [selectedSemaine, weekMap]);

    const filteredSeances = useMemo(() => {
        return seances.filter(seance => {
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const content = `${seance.cours} ${seance.professeur} ${seance.classe} ${seance.moduleLibelle ?? ''}`;
                if (!content.toLowerCase().includes(search)) {
                    return false;
                }
            }
            if (selectedClasse !== ALL_CLASSES && seance.classeId !== selectedClasse) {
                return false;
            }
            if (moduleFilter !== ALL_MODULES && seance.moduleId !== moduleFilter) {
                return false;
            }
            if (selectedSemaine) {
                const week = weekMap.get(selectedSemaine);
                if (!week || !isWithinWeek(seance.dateISO, week)) {
                    return false;
                }
            }
            return true;
        });
    }, [moduleFilter, seances, searchTerm, selectedClasse, selectedSemaine, weekMap]);

    const planningGrid = useMemo(() => {
        const grid: Record<string, Record<string, SeancePlanning[]>> = {};
        JOUR_OPTIONS.forEach(jour => {
            grid[jour] = {};
            TIME_SLOTS.forEach(slot => {
                grid[jour][slot.id] = [];
            });
        });
        filteredSeances.forEach(seance => {
            const slot = TIME_SLOTS.find(s => seance.heureDebut.startsWith(s.debut.split(':')[0]));
            const slotId = slot?.id ?? `${seance.heureDebut}-${seance.heureFin}`;
            if (!grid[seance.jour][slotId]) {
                grid[seance.jour][slotId] = [];
            }
            grid[seance.jour][slotId].push(seance);
        });
        return grid;
    }, [filteredSeances]);

    const currentPlanning: PlanningSemaine | null = useMemo(() => {
        if (selectedClasse === ALL_CLASSES || !selectedSemaine) {
            return null;
        }
        const week = weekMap.get(selectedSemaine);
        if (!week) return null;
        const seancesForWeek = seances.filter(
            seance => seance.classeId === selectedClasse && isWithinWeek(seance.dateISO, week)
        );
        const classeLabel = classOptions.find(option => option.id === selectedClasse)?.label ?? 'Classe';
        return {
            id: `${selectedClasse}-${selectedSemaine}`,
            classe: classeLabel,
            classeId: selectedClasse,
            semaineDebut: week.debut,
            semaineFin: week.fin,
            seances: seancesForWeek,
            creeLe: week.debut
        };
    }, [classOptions, seances, selectedClasse, selectedSemaine, weekMap]);

    const handleCreatePlanning = (classeId: string, semaineId: string) => {
        setSelectedClasse(classeId || ALL_CLASSES);
        setSelectedSemaine(semaineId);
        setShowCreatePlanningModal(false);
    };

    const handleDragStart = (seance: SeancePlanning) => {
        setDraggedSeance(seance);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (jour: JourSemaine, creneauId: string) => {
        if (!draggedSeance) return;
        const session = sessionMap.get(draggedSeance.id);
        if (!session) return;

        const week = buildWeekOption(draggedSeance.dateISO);
        const newDate = dateFromWeekAndDay(week.debut, jour);
        const [startHour, endHour] = creneauId.split('-');

        try {
            setIsMutating(true);
            await updateSession(
                draggedSeance.id,
                buildSessionPayload(session, {
                    date: newDate,
                    startHour,
                    endHour
                })
            );
            await loadSessionsPage(0, false);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Impossible de déplacer la séance.';
            alert(message);
        } finally {
            setDraggedSeance(null);
            setIsMutating(false);
        }
    };

    const handleLoadMoreSessions = async () => {
        if (!hasMoreSessions || isLoadingMore) {
            return;
        }
        const nextPage = (sessionMeta?.page ?? 0) + 1;
        try {
            setIsLoadingMore(true);
            await loadSessionsPage(nextPage, true);
        } catch (err) {
            console.error('Unable to load more sessions', err);
            setError(err instanceof ApiError ? err.message : 'Impossible de charger plus de séances.');
        } finally {
            setIsLoadingMore(false);
        }
    };

    const closeFormModal = () => {
        setShowAddModal(false);
        setEditingSessionId(null);
        setEditingWeekStart(null);
        setFormState(createFormState());
    };

    const handleOpenCreateModal = (preset?: Partial<SessionFormState>) => {
        if (selectedClasse === ALL_CLASSES || !selectedSemaine) {
            alert('Sélectionnez une classe et une semaine avant d’ajouter une séance.');
            return;
        }
        const week = weekMap.get(selectedSemaine);
        if (!week) {
            alert('Semaine invalide.');
            return;
        }
        setEditingSessionId(null);
        setEditingWeekStart(week.debut);
        setFormState(createFormState({
            classeId: selectedClasse !== ALL_CLASSES ? selectedClasse : '',
            salleInput: salles[0]?.libelle ?? '',
            ...preset
        }));
        setShowAddModal(true);
    };

    const handleEditSeance = (seance: SeancePlanning) => {
        const session = sessionMap.get(seance.id);
        if (!session) {
            alert('Impossible de récupérer les détails de la séance.');
            return;
        }
        const week = buildWeekOption(session.date);
        setEditingSessionId(seance.id);
        setEditingWeekStart(week.debut);
        setFormState(createFormState({
            classeId: session.classe?.id ?? seance.classeId ?? '',
            coursId: session.cours?.id ?? '',
            jour: normalizeJour(session.date),
            creneau: buildSlotId(session.startHour, session.endHour),
            professeurId: session.professor?.id ?? '',
            salleInput: session.salle?.libelle ?? seance.salle
        }));
        setSelectedSeance(null);
        setShowAddModal(true);
    };

    const handleSubmitSession = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formState.classeId) {
            alert('Merci de sélectionner une classe.');
            return;
        }
        if (!formState.coursId) {
            alert('Merci de sélectionner un cours.');
            return;
        }
        const salle = salles.find(salleItem =>
            salleItem.id === formState.salleInput ||
            salleItem.libelle.toLowerCase() === formState.salleInput.toLowerCase()
        );
        if (!salle) {
            alert('Merci de sélectionner une salle existante.');
            return;
        }
        const selectedCourse = courses.find(course => course.id === formState.coursId);
        const [startHour, endHour] = formState.creneau.split('-');
        try {
            setIsMutating(true);
            if (editingSessionId) {
                const session = sessionMap.get(editingSessionId);
                if (!session) {
                    throw new Error('Session introuvable.');
                }
                const weekStart = editingWeekStart ?? buildWeekOption(session.date).debut;
                await updateSession(
                    editingSessionId,
                    buildSessionPayload(session, {
                        date: dateFromWeekAndDay(weekStart, formState.jour),
                        startHour,
                        endHour,
                        classeId: formState.classeId,
                        coursId: formState.coursId,
                        moduleId: selectedCourse?.module?.id ?? session.module?.id ?? null,
                        professorId: formState.professeurId || session.professor?.id || null,
                        salleId: salle.id,
                        libelle: selectedCourse?.libelle ?? session.libelle
                    })
                );
            } else {
                if (!selectedSemaine) {
                    alert('Sélectionnez une semaine pour planifier.');
                    return;
                }
                const week = weekMap.get(selectedSemaine);
                if (!week) {
                    alert('Semaine invalide.');
                    return;
                }
                if (!selectedCourse) {
                    alert('Cours introuvable.');
                    return;
                }
                const payload: SessionRequestDto = {
                    date: dateFromWeekAndDay(week.debut, formState.jour),
                    startHour,
                    endHour,
                    duration: null,
                    typeSession: 'COURS',
                    modeSession: 'PRESENTIEL',
                    status: 'PROGRAMME',
                    libelle: selectedCourse.libelle,
                    sessionSummary: null,
                    coursId: selectedCourse.id,
                    moduleId: selectedCourse.module?.id ?? null,
                    classeId: formState.classeId,
                    classIds: null,
                    professorId: formState.professeurId || null,
                    salleId: salle.id
                };
                await createSession(payload);
            }
            closeFormModal();
            await loadSessionsPage(0, false);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Impossible d’enregistrer la séance.';
            alert(message);
        } finally {
            setIsMutating(false);
        }
    };

    const handleDeleteSeance = async (id: string) => {
        if (!confirm('Supprimer cette séance ?')) {
            return;
        }
        try {
            setIsMutating(true);
            await deleteSession(id);
            setSelectedSeance(null);
            await loadSessionsPage(0, false);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Impossible de supprimer la séance.';
            alert(message);
        } finally {
            setIsMutating(false);
        }
    };

    const getCouleurGradient = (status?: SessionStatus | null) => {
        return computeColor(status);
    };

    if (isLoading) {
        return (
            <div className="planning-container content-scroll" style={{ padding: '40px' }}>
                Chargement du planning...
            </div>
        );
    }

    if (error) {
        return (
            <div className="planning-container content-scroll" style={{ padding: '40px', color: '#dc2626' }}>
                {error}
            </div>
        );
    }

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
                            {weekOptions.map(semaine => (
                                <option key={semaine.id} value={semaine.id}>{semaine.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Layers size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                        <select
                            value={selectedClasse}
                            onChange={(e) => setSelectedClasse(e.target.value)}
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
                            {classOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Layers size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                        <select
                            value={moduleFilter}
                            onChange={(e) => setModuleFilter(e.target.value)}
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
                                minWidth: '180px'
                            }}
                        >
                            {moduleOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>

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

                    {currentPlanning && (
                        <button
                            onClick={() => handleOpenCreateModal()}
                            disabled={isMutating}
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
                                boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                                opacity: isMutating ? 0.7 : 1
                            }}
                        >
                            <Plus size={18} />
                            Ajouter
                        </button>
                    )}
                </div>
            </div>

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

            <div style={{
                flex: 1,
                padding: '16px 24px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {viewMode === 'vertical' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '100px repeat(6, 1fr)',
                        gap: '8px',
                        marginBottom: '8px',
                        flexShrink: 0
                    }}>
                        <div
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPlanning ? 'pointer' : 'default' }}
                            onClick={() => currentPlanning && handleOpenCreateModal()}
                        >
                            <div style={{
                                width: '44px',
                                height: '44px',
                                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}>
                                <Plus size={20} color="#cbd5e1" />
                            </div>
                        </div>

                        {JOUR_OPTIONS.map(jour => (
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

                {viewMode === 'vertical' && (
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}>
                        {TIME_SLOTS.map(creneau => (
                            <div
                                key={creneau.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '100px repeat(6, 1fr)',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}
                            >
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

                                {JOUR_OPTIONS.map(jour => {
                                    const seancesCellule = planningGrid[jour]?.[creneau.id] ?? [];

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
                                            {seancesCellule.length > 0 ? (
                                                seancesCellule.map(seance => (
                                                    <div
                                                        key={seance.id}
                                                        draggable
                                                        onDragStart={() => handleDragStart(seance)}
                                                        onClick={() => setSelectedSeance(seance)}
                                                        style={{
                                                            background: getCouleurGradient(seance.status),
                                                            borderRadius: '6px',
                                                            padding: '6px 8px',
                                                            color: 'white',
                                                            cursor: 'grab',
                                                            fontSize: '10px',
                                                            borderLeft: '3px solid rgba(255,255,255,0.5)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '2px'
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: '700', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <GripVertical size={12} />
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
                                                            onClick={() => handleOpenCreateModal({ jour, creneau: creneau.id })}
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

                {viewMode === 'horizontal' && (
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'auto'
                    }}>
                        {JOUR_OPTIONS.map(jour => (
                            <div
                                key={jour}
                                style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '6px',
                                    minHeight: '70px'
                                }}
                            >
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

                                {TIME_SLOTS.map(creneau => {
                                    const seancesCellule = planningGrid[jour]?.[creneau.id] ?? [];

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
                                                            background: getCouleurGradient(seance.status),
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

                {hasMoreSessions && (
                    <div style={{ padding: '12px 0 8px', textAlign: 'center' }}>
                        <button
                            onClick={handleLoadMoreSessions}
                            disabled={isLoadingMore}
                            style={{
                                padding: '10px 26px',
                                borderRadius: '999px',
                                border: '1px solid #cbd5f5',
                                background: 'white',
                                color: '#1d4ed8',
                                fontWeight: 600,
                                cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                                opacity: isLoadingMore ? 0.7 : 1,
                                boxShadow: '0 6px 18px rgba(59,130,246,0.15)'
                            }}
                        >
                            {isLoadingMore ? 'Chargement...' : 'Charger plus de séances'}
                        </button>
                    </div>
                )}
            </div>

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
                            background: getCouleurGradient(selectedSeance.status),
                            borderRadius: '12px',
                            padding: '16px',
                            color: 'white',
                            marginBottom: '20px'
                        }}>
                            <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{selectedSeance.classe}</div>
                            <div style={{ fontWeight: '600', fontSize: '15px' }}>{selectedSeance.cours}</div>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>{selectedSeance.moduleLibelle ?? 'Sans module'}</div>
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
                            <button
                                onClick={() => handleEditSeance(selectedSeance)}
                                disabled={isMutating}
                                style={{
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
                                disabled={isMutating}
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
                                    cursor: 'pointer',
                                    opacity: isMutating ? 0.7 : 1
                                }}>
                                <Trash2 size={16} />
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                    {classOptions.filter(option => option.id !== ALL_CLASSES).map(option => (
                                        <option key={option.id} value={option.id}>{option.label}</option>
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
                                    {weekOptions.map(semaine => (
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
                    onClick={closeFormModal}
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
                                {editingSessionId ? 'Modifier la séance' : 'Ajouter une séance'}
                            </h2>
                            <button
                                onClick={closeFormModal}
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

                        <form onSubmit={handleSubmitSession}>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Classe</label>
                                <select
                                    name="classe"
                                    required
                                    value={formState.classeId}
                                    onChange={(e) => setFormState(prev => ({ ...prev, classeId: e.target.value }))}
                                    style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <option value="">Sélectionner une classe</option>
                                    {classOptions.filter(option => option.id !== ALL_CLASSES).map(option => (
                                        <option key={option.id} value={option.id}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Cours</label>
                                <select
                                    name="cours"
                                    required
                                    value={formState.coursId}
                                    onChange={(e) => setFormState(prev => ({ ...prev, coursId: e.target.value }))}
                                    style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <option value="">Sélectionner un cours</option>
                                    {courses.map(cours => (
                                        <option key={cours.id} value={cours.id}>{cours.libelle}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Jour</label>
                                    <select
                                        name="jour"
                                        required
                                        value={formState.jour}
                                        onChange={(e) => setFormState(prev => ({ ...prev, jour: e.target.value as JourSemaine }))}
                                        style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}>
                                        {JOUR_OPTIONS.map(jour => (
                                            <option key={jour} value={jour}>{jour}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Créneau</label>
                                    <select
                                        name="creneau"
                                        required
                                        value={formState.creneau}
                                        onChange={(e) => setFormState(prev => ({ ...prev, creneau: e.target.value }))}
                                        style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}>
                                        {TIME_SLOTS.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Professeur</label>
                                <select
                                    name="professeur"
                                    required
                                    value={formState.professeurId}
                                    onChange={(e) => setFormState(prev => ({ ...prev, professeurId: e.target.value }))}
                                    style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}>
                                    <option value="">Sélectionner un professeur</option>
                                    {professors.map(prof => (
                                        <option key={prof.professorId} value={prof.professorId}>
                                            {prof.firstName} {prof.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Salle</label>
                                <input
                                    name="salle"
                                    list="salle-options"
                                    type="text"
                                    required
                                    placeholder="Sélectionner une salle"
                                    value={formState.salleInput}
                                    onChange={(e) => setFormState(prev => ({ ...prev, salleInput: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <datalist id="salle-options">
                                    {salles.map(salle => (
                                        <option key={salle.id} value={salle.libelle}>{salle.id}</option>
                                    ))}
                                </datalist>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={closeFormModal}
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
                                    disabled={isMutating}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        opacity: isMutating ? 0.7 : 1
                                    }}
                                >
                                    {editingSessionId ? 'Mettre à jour' : 'Ajouter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
