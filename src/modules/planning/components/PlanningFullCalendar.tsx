'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Search,
    Plus,
    ChevronDown,
    X,
    Calendar,
    Layers,
    RotateCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';
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
import { JOUR_OPTIONS, STATUS_COLOR } from '../constants';
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
import { JourSemaine, SeancePlanning } from '../types';
import { useAuth } from '@/modules/auth/context/AuthContext';

const ALL_CLASSES = 'ALL_CLASSES';
const ALL_MODULES = 'ALL_MODULES';
const ALL_SALLES = 'ALL_SALLES';

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
    date: string;
    startHour: string;
    endHour: string;
    professeurId: string;
    salleId: string;
}

interface CalendarEventClickInfo {
    event: {
        extendedProps: {
            session?: SessionResponseDto;
            extendedProps?: Partial<SeancePlanning>;
            [key: string]: unknown;
        };
    };
}

interface CalendarDateClickInfo {
    date: Date;
    dateStr: string;
}

interface CalendarSelectInfo {
    start: Date;
    end: Date;
}

interface CalendarEventDropInfo extends CalendarEventClickInfo {
    event: {
        start: Date | null;
        end: Date | null;
        extendedProps: {
            session?: SessionResponseDto;
            extendedProps?: Partial<SeancePlanning>;
            [key: string]: unknown;
        };
    };
    revert?: () => void;
}

function createFormState(overrides: Partial<SessionFormState> = {}): SessionFormState {
    return {
        classeId: '',
        coursId: '',
        date: new Date().toISOString().split('T')[0],
        startHour: '08:00',
        endHour: '10:00',
        professeurId: '',
        salleId: '',
        ...overrides
    };
}

function computeColor(status?: SessionStatus | null): string {
    if (!status) return STATUS_COLOR.DEFAULT;
    return STATUS_COLOR[status] ?? STATUS_COLOR.DEFAULT;
}

function computeHexColor(status?: SessionStatus | null): string {
    if (!status || status === 'PROGRAMME') return '#3b82f6';
    if (status === 'EN_COURS') return '#f97316';
    if (status === 'TERMINEE') return '#22c55e';
    if (status === 'ANNULE') return '#ef4444';
    return '#6b7280';
}

function normalizeDate(rawDate: unknown): string | null {
    if (!rawDate) return null;
    const value = String(rawDate).trim();
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    if (value.includes(',')) {
        const [year, month, day] = value.split(',').map(part => part.trim());
        if (!year || !month || !day) return null;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
    }

    return null;
}

function normalizeTime(rawTime: unknown): string | null {
    if (!rawTime) return null;
    const value = String(rawTime).trim().replace(/,/g, ':');
    if (!value || !value.includes(':')) return null;

    const parts = value.split(':');
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    const second = Number(parts[2] ?? '0');

    if ([hour, minute, second].some(part => Number.isNaN(part))) return null;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return null;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
}

function toMinutes(time: string): number {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
}

function fromMinutes(totalMinutes: number): string {
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const hour = Math.floor(normalized / 60);
    const minute = normalized % 60;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

function computeEndTime(startHour: string, endHour?: unknown, duration?: number | null): string {
    const normalizedEnd = normalizeTime(endHour);
    if (normalizedEnd && toMinutes(normalizedEnd) > toMinutes(startHour)) {
        return normalizedEnd;
    }

    if (typeof duration === 'number' && duration > 0) {
        const durationInMinutes = duration <= 12 ? duration * 60 : duration;
        return fromMinutes(toMinutes(startHour) + durationInMinutes);
    }

    return fromMinutes(toMinutes(startHour) + 120);
}

function normalizeSessionSchedule(session: SessionResponseDto): {
    date: string;
    startHour: string;
    endHour: string;
} | null {
    const date = normalizeDate(session.date);
    const startHour = normalizeTime(session.startHour);
    if (!date || !startHour) return null;

    return {
        date,
        startHour,
        endHour: computeEndTime(startHour, session.endHour, session.duration)
    };
}

function toInputTime(time?: string | null): string {
    const normalized = normalizeTime(time);
    if (!normalized) return '';
    return normalized.slice(0, 5);
}

function toApiTime(time: string): string {
    const normalized = normalizeTime(time);
    return normalized ?? '08:00:00';
}

function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatLocalTime(date: Date): string {
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${hour}:${minute}`;
}

function addMinutes(time: string, minutesToAdd: number): string {
    const [hour, minute] = time.split(':').map(Number);
    const total = hour * 60 + minute + minutesToAdd;
    const normalized = ((total % 1440) + 1440) % 1440;
    const nextHour = Math.floor(normalized / 60);
    const nextMinute = normalized % 60;
    return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
}

function mapSessionToEvent(session: SessionResponseDto): SeancePlanning {
    const normalized = normalizeSessionSchedule(session);
    const safeDate = normalized?.date ?? normalizeDate(session.date) ?? new Date().toISOString().split('T')[0];
    const safeStartHour = normalized?.startHour ?? toApiTime(String(session.startHour ?? '08:00'));
    const safeEndHour = normalized?.endHour ?? fromMinutes(toMinutes(safeStartHour) + 120);

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
        jour: JOUR_OPTIONS[new Date(safeDate).getDay() - 1] || 'Lundi',
        dateISO: safeDate,
        heureDebut: safeStartHour.slice(0, 5),
        heureFin: safeEndHour.slice(0, 5),
        couleur: computeColor(session.status),
        status: session.status,
        typeSession: session.typeSession,
        modeSession: session.modeSession
    };
}

export default function PlanningFullCalendar() {
    const { roles } = useAuth();
    const isProfesseur = roles.includes('ROLE_PROFESSEUR');
    const [isMobileView, setIsMobileView] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState(ALL_MODULES);
    const [salleFilter, setSalleFilter] = useState(ALL_SALLES);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<SeancePlanning | null>(null);
    const [selectedClasse, setSelectedClasse] = useState<string>(ALL_CLASSES);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [calendarRef, setCalendarRef] = useState<FullCalendar | null>(null);
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
    const [sessionMeta, setSessionMeta] = useState<Metadata | null>(null);
    const [hasMoreSessions, setHasMoreSessions] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [calendarKey, setCalendarKey] = useState(0);
    const sessionPageSize = 100;
    const selectedCourseForForm = useMemo(
        () => courses.find(course => course.id === formState.coursId) ?? null,
        [courses, formState.coursId]
    );
    const lockedProfessorId = selectedCourseForForm?.professor?.id ?? '';
    const isProfessorLockedByCourse = Boolean(lockedProfessorId);
    const effectiveProfessorId = lockedProfessorId || formState.professeurId;

    const loadSessionsPage = useCallback(async (page = 0, append = false) => {
        const result = await fetchSessions({
            size: sessionPageSize,
            page
        });
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

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const syncMobile = () => setIsMobileView(mediaQuery.matches);
        syncMobile();
        mediaQuery.addEventListener('change', syncMobile);
        return () => mediaQuery.removeEventListener('change', syncMobile);
    }, []);

    useEffect(() => {
        if (!calendarRef) {
            return;
        }
        const api = calendarRef.getApi();
        const targetView = isMobileView ? 'timeGridDay' : 'timeGridWeek';
        if (api.view.type !== targetView) {
            api.changeView(targetView);
        }
    }, [calendarRef, isMobileView]);

    const events = useMemo(() => {
        const mappedEvents = sessions
            .filter(session => {
                if (searchTerm) {
                    const search = searchTerm.toLowerCase();
                    const cours = session.cours?.libelle ?? session.libelle ?? '';
                    const classe = session.classe?.libelle ?? '';
                    const prof = session.professor ? `${session.professor.prenom ?? ''} ${session.professor.nom ?? ''}` : '';
                    if (!cours.toLowerCase().includes(search) &&
                        !classe.toLowerCase().includes(search) &&
                        !prof.toLowerCase().includes(search)) {
                        return false;
                    }
                }
                if (selectedClasse !== ALL_CLASSES) {
                    const classeId = session.classe?.id ?? session.classes?.[0]?.id;
                    if (classeId !== selectedClasse) return false;
                }
                if (moduleFilter !== ALL_MODULES) {
                    const moduleId = session.module?.id;
                    if (moduleId !== moduleFilter) return false;
                }
                if (salleFilter !== ALL_SALLES) {
                    const salleId = session.salle?.id;
                    if (salleId !== salleFilter) return false;
                }
                return true;
            })
            .map(session => {
                const normalized = normalizeSessionSchedule(session);
                if (!normalized) return null;

                const eventStart = `${normalized.date}T${normalized.startHour}`;
                const eventEnd = `${normalized.date}T${normalized.endHour}`;

                return {
                    id: session.id,
                    title: `${session.cours?.libelle ?? session.libelle}`,
                    start: eventStart,
                    end: eventEnd,
                    backgroundColor: computeHexColor(session.status),
                    borderColor: computeHexColor(session.status),
                    extendedProps: {
                        ...mapSessionToEvent(session),
                        session: session
                    }
                };
            })
            .filter((event): event is NonNullable<typeof event> => Boolean(event));

        console.log('Events mapped:', mappedEvents.length);
        return mappedEvents;
    }, [sessions, searchTerm, selectedClasse, moduleFilter, salleFilter]);

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

    const salleOptions = useMemo(
        () => [
            { id: ALL_SALLES, label: 'Toutes les salles' },
            ...salles
                .slice()
                .sort((a, b) => a.libelle.localeCompare(b.libelle))
                .map(salle => ({ id: salle.id, label: salle.libelle }))
        ],
        [salles]
    );

    const applyCourseSelection = useCallback((courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        const autoProfessorId = course?.professor?.id ?? '';
        setFormState(prev => ({
            ...prev,
            coursId: courseId,
            professeurId: autoProfessorId
        }));
    }, [courses]);

    const openCreateModalWithSlot = useCallback((start: Date, end?: Date) => {
        const date = formatLocalDate(start);
        const startHour = formatLocalTime(start);
        const endHour = end ? formatLocalTime(end) : addMinutes(startHour, 120);
        setSelectedDate(date);
        setEditingSessionId(null);
        setFormState(createFormState({
            date,
            startHour,
            endHour: endHour === startHour ? addMinutes(startHour, 120) : endHour,
            salleId: salles[0]?.id ?? ''
        }));
        setShowAddModal(true);
    }, [salles]);

    const handleDateClick = useCallback((info: CalendarDateClickInfo) => {
        if (isProfesseur) {
            return;
        }
        openCreateModalWithSlot(info.date);
    }, [isProfesseur, openCreateModalWithSlot]);

    const handleSelect = useCallback((info: CalendarSelectInfo) => {
        if (isProfesseur) {
            return;
        }
        openCreateModalWithSlot(info.start, info.end);
    }, [isProfesseur, openCreateModalWithSlot]);

    const handleEventClick = useCallback((info: CalendarEventClickInfo) => {
        if (isProfesseur) {
            return;
        }
        const session = info.event.extendedProps.session;
        const seanceRaw = info.event.extendedProps.extendedProps;
        
        // Validate that seance has required id before using
        if (!seanceRaw?.id) {
            return;
        }
        
        const seance = seanceRaw as SeancePlanning;

        setSelectedEvent(seance);
        setEditingSessionId(session?.id ?? null);
        const normalizedStart = toInputTime(session?.startHour ?? '');
        const normalizedEnd = toInputTime(session?.endHour ?? '');
        const normalizedDate = normalizeDate(session?.date) ?? '';
        setFormState({
            classeId: session?.classe?.id ?? seance?.classeId ?? '',
            coursId: session?.cours?.id ?? '',
            date: normalizedDate,
            startHour: normalizedStart || '08:00',
            endHour: normalizedEnd || '10:00',
            professeurId: session?.professor?.id ?? '',
            salleId: session?.salle?.id ?? seance?.salleId ?? ''
        });
        setShowAddModal(true);
    }, [isProfesseur]);

    const handleEventDrop = useCallback(async (info: CalendarEventDropInfo) => {
        if (isProfesseur) {
            if (typeof info.revert === 'function') info.revert();
            return;
        }
        const session = info.event.extendedProps.session;
        if (!session) {
            if (typeof info.revert === 'function') info.revert();
            return;
        }
        const newDate = info.event.start
            ? info.event.start.toISOString().split('T')[0]
            : (normalizeDate(session.date) ?? new Date().toISOString().split('T')[0]);

        // Get time from the dropped event and format as HH:MM:SS
        const getTimeWithSeconds = (date: Date | null, fallback: string): string => {
            if (!date) return toApiTime(fallback);
            const time = date.toTimeString().slice(0, 8); // HH:MM:SS format
            return time;
        };

        const fallbackStart = normalizeTime(session.startHour) ?? '08:00:00';
        const fallbackEnd = computeEndTime(fallbackStart, session.endHour, session.duration);
        const newStartHour = getTimeWithSeconds(info.event.start, fallbackStart);
        const droppedEndHour = getTimeWithSeconds(info.event.end, fallbackEnd);
        const newEndHour = computeEndTime(newStartHour, droppedEndHour, session.duration);

        console.log('Event drop - new values:', { newDate, newStartHour, newEndHour, session: session.id });

        try {
            setIsMutating(true);
            // Send complete payload with all required fields
            await updateSession(session.id, {
                date: newDate,
                startHour: newStartHour,
                endHour: newEndHour,
                duration: session.duration ?? null,
                typeSession: session.typeSession ?? 'COURS',
                modeSession: session.modeSession ?? 'PRESENTIEL',
                status: session.status ?? 'PROGRAMME',
                libelle: session.libelle ?? session.cours?.libelle ?? '',
                sessionSummary: session.sessionSummary ?? null,
                coursId: session.cours?.id ?? null,
                moduleId: session.module?.id ?? null,
                classeId: session.classe?.id ?? null,
                classIds: null,
                professorId: session.professor?.id ?? null,
                salleId: session.salle?.id ?? null
            });
            await loadSessionsPage(0, false);

            // Forcer le re-render du calendrier
            setCalendarKey(prev => prev + 1);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Impossible de déplacer la séance.';
            Swal.fire({
                title: 'Erreur',
                text: message,
                icon: 'error'
            });
            if (typeof info.revert === 'function') info.revert();
        } finally {
            setIsMutating(false);
        }
    }, [isProfesseur, loadSessionsPage]);

    const handleDeleteSeance = async (id: string) => {
        if (isProfesseur) {
            return;
        }
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: 'Voulez-vous vraiment supprimer cette séance ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            setIsMutating(true);
            await deleteSession(id);
            setSelectedEvent(null);
            setShowAddModal(false);
            await loadSessionsPage(0, false);

            // Forcer le re-render du calendrier
            setCalendarKey(prev => prev + 1);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Impossible de supprimer la séance.';
            Swal.fire({
                title: 'Erreur',
                text: message,
                icon: 'error'
            });
        } finally {
            setIsMutating(false);
        }
    };

    const handleSubmitSession = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isProfesseur) {
            return;
        }

        if (!formState.classeId) {
            alert('Merci de sélectionner une classe.');
            return;
        }
        if (!formState.coursId) {
            alert('Merci de sélectionner un cours.');
            return;
        }
        if (!formState.salleId) {
            alert('Merci de sélectionner une salle.');
            return;
        }

        const selectedCourse = courses.find(course => course.id === formState.coursId);
        const payloadStartHour = toApiTime(formState.startHour);
        const payloadEndHour = computeEndTime(payloadStartHour, toApiTime(formState.endHour), null);
        const payloadProfessorId = (selectedCourse?.professor?.id ?? formState.professeurId) || null;

        try {
            setIsMutating(true);

            if (editingSessionId) {
                const existingSession = sessions.find(s => s.id === editingSessionId);
                if (!existingSession) {
                    throw new Error('Session introuvable.');
                }

                await updateSession(editingSessionId, {
                    date: formState.date,
                    startHour: payloadStartHour,
                    endHour: payloadEndHour,
                    duration: null,
                    typeSession: existingSession.typeSession,
                    modeSession: existingSession.modeSession,
                    status: existingSession.status,
                    libelle: selectedCourse?.libelle ?? existingSession.libelle,
                    sessionSummary: existingSession.sessionSummary,
                    coursId: formState.coursId,
                    moduleId: selectedCourse?.module?.id ?? existingSession.module?.id ?? null,
                    classeId: formState.classeId,
                    classIds: null,
                    professorId: payloadProfessorId,
                    salleId: formState.salleId
                });
            } else {
                const payload: SessionRequestDto = {
                    date: formState.date,
                    startHour: payloadStartHour,
                    endHour: payloadEndHour,
                    duration: null,
                    typeSession: 'COURS',
                    modeSession: 'PRESENTIEL',
                    status: 'PROGRAMME',
                    libelle: selectedCourse?.libelle ?? '',
                    sessionSummary: null,
                    coursId: formState.coursId,
                    moduleId: selectedCourse?.module?.id ?? null,
                    classeId: formState.classeId,
                    classIds: null,
                    professorId: payloadProfessorId,
                    salleId: formState.salleId
                };
                await createSession(payload);
            }

            setShowAddModal(false);
            setEditingSessionId(null);
            setFormState(createFormState());

            // Naviguer vers la date de la séance créée
            if (calendarRef && formState.date) {
                const calendarApi = calendarRef.getApi();
                calendarApi.gotoDate(formState.date);
            }

            await loadSessionsPage(0, false);

            // Forcer le re-render du calendrier
            setCalendarKey(prev => prev + 1);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Impossible d\'enregistrer la séance.';
            alert(message);
        } finally {
            setIsMutating(false);
        }
    };

    const closeFormModal = () => {
        setShowAddModal(false);
        setEditingSessionId(null);
        setFormState(createFormState());
    };

    const handlePrev = () => {
        calendarRef?.getApi().prev();
        if (calendarRef) {
            setSelectedDate(calendarRef.getApi().getDate().toISOString().split('T')[0]);
        }
    };

    const handleNext = () => {
        calendarRef?.getApi().next();
        if (calendarRef) {
            setSelectedDate(calendarRef.getApi().getDate().toISOString().split('T')[0]);
        }
    };

    const handleToday = () => {
        calendarRef?.getApi().today();
        if (calendarRef) {
            setSelectedDate(calendarRef.getApi().getDate().toISOString().split('T')[0]);
        }
    };

    if (isLoading) {
        return (
            <div className="planning-container" style={{ padding: '40px' }}>
                Chargement du planning...
            </div>
        );
    }

    if (error) {
        return (
            <div className="planning-container" style={{ padding: '40px', color: '#dc2626' }}>
                {error}
            </div>
        );
    }

    return (
        <div
            className="planning-container"
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: isMobileView ? 'auto' : 'calc(100vh - 140px)',
                minHeight: isMobileView ? 'calc(100vh - 110px)' : undefined,
                background: 'white',
                borderRadius: isMobileView ? '16px' : '24px',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}
        >
            <style jsx>{`
                .fc {
                    font-family: inherit;
                }
                .fc .fc-toolbar-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                }
                .fc .fc-button {
                    background: linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: 500;
                }
                .fc .fc-button:hover {
                    background: linear-gradient(135deg, #4169B8 0%, #3652a0 100%);
                }
                .fc .fc-day-today {
                    background: #f0f9ff !important;
                }
                .fc .fc-event {
                    border-radius: 6px;
                    padding: 2px 4px;
                    font-size: 12px;
                    cursor: pointer;
                }
                .fc .fc-timegrid-slot {
                    height: 48px;
                }
                .fc .fc-col-header-cell-cushion {
                    padding: 12px 0;
                    font-weight: 600;
                    color: #475569;
                }
                @media (max-width: 768px) {
                    .fc .fc-toolbar {
                        flex-direction: column;
                        gap: 12px;
                    }
                    .planning-controls {
                        flex-wrap: wrap !important;
                    }
                    .planning-header {
                        padding: 14px !important;
                    }
                    .planning-title {
                        font-size: 18px !important;
                    }
                    .planning-control-field {
                        width: 100% !important;
                    }
                    .planning-control-input,
                    .planning-control-select {
                        width: 100% !important;
                        min-width: 100% !important;
                    }
                    .mobile-hide-filter {
                        display: none !important;
                    }
                    .planning-calendar-nav {
                        justify-content: space-between !important;
                        margin-bottom: 10px !important;
                    }
                    .planning-date-badge {
                        display: inline-flex !important;
                    }
                    :global(.fc .fc-timegrid-slot) {
                        height: 40px !important;
                    }
                    :global(.fc .fc-timegrid-axis-cushion),
                    :global(.fc .fc-timegrid-slot-label-cushion) {
                        font-size: 11px !important;
                    }
                    :global(.fc .fc-col-header-cell-cushion) {
                        font-size: 12px !important;
                        padding: 8px 0 !important;
                    }
                    :global(.fc .fc-event-main) {
                        font-size: 11px !important;
                        line-height: 1.2;
                    }
                }
            `}</style>

            <div className="planning-header" style={{
                padding: '20px 32px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <h1 className="planning-title" style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: 0
                }}>
                    Planning des séances
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }} className="planning-controls">
                    <div style={{ position: 'relative' }} className="planning-control-field">
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="planning-control-input"
                            style={{
                                padding: '10px 16px 10px 42px',
                                borderRadius: '12px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                width: '180px',
                                background: '#f8fafc'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }} className="planning-control-field">
                        <Layers size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                        <select
                            value={selectedClasse}
                            onChange={(e) => setSelectedClasse(e.target.value)}
                            className="planning-control-select"
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

                    <div style={{ position: 'relative' }} className="planning-control-field mobile-hide-filter">
                        <Layers size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                        <select
                            value={moduleFilter}
                            onChange={(e) => setModuleFilter(e.target.value)}
                            className="planning-control-select"
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

                    <div style={{ position: 'relative' }} className="planning-control-field mobile-hide-filter">
                        <Layers size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                        <select
                            value={salleFilter}
                            onChange={(e) => setSalleFilter(e.target.value)}
                            className="planning-control-select"
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
                            {salleOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>

                    {!isProfesseur && (
                        <button
                            onClick={() => {
                                setEditingSessionId(null);
                                setFormState(createFormState({
                                    date: new Date().toISOString().split('T')[0],
                                    salleId: salles[0]?.id ?? ''
                                }));
                                setShowAddModal(true);
                            }}
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
                            Nouvelle séance
                        </button>
                    )}
                </div>
            </div>

            <div style={{
                flex: 1,
                padding: '16px 24px',
                overflow: 'hidden'
            }}>
                <div className="planning-calendar-nav" style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '16px',
                    justifyContent: 'flex-end'
                }}>
                    <span className="planning-date-badge" style={{
                        display: 'none',
                        padding: '8px 10px',
                        borderRadius: '999px',
                        border: '1px solid #dbeafe',
                        background: '#eff6ff',
                        color: '#1e3a8a',
                        fontSize: '12px',
                        fontWeight: 600
                    }}>
                        {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                    </span>
                    <button
                        onClick={handlePrev}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 12px',
                            background: 'white',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <ChevronLeft size={18} color="#64748b" />
                    </button>
                    <button
                        onClick={handleToday}
                        style={{
                            padding: '8px 16px',
                            background: 'white',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            fontWeight: '500',
                            color: '#475569',
                            cursor: 'pointer'
                        }}
                    >
                        Aujourd&apos;hui
                    </button>
                    <button
                        onClick={handleNext}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 12px',
                            background: 'white',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <ChevronRight size={18} color="#64748b" />
                    </button>
                </div>

                <FullCalendar
                    key={calendarKey}
                    ref={(el) => setCalendarRef(el)}
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView={isMobileView ? 'timeGridDay' : 'timeGridWeek'}
                    headerToolbar={false}
                    events={(info, successCallback) => {
                        // Debug: Log the date range FullCalendar is requesting
                        console.log('FullCalendar requesting events for:', info.start, 'to', info.end);
                        console.log('Total events available:', events.length);

                        // Return all events - FullCalendar will filter by date range
                        if (events.length > 0) {
                            console.log('Sample events:', events.slice(0, 3));
                        }

                        successCallback(events);
                    }}
                    editable={!isProfesseur}
                    droppable={!isProfesseur}
                    selectable={!isProfesseur}
                    selectMirror={true}
                    dayMaxEvents={!isMobileView}
                    weekends={true}
                    slotMinTime="08:00:00"
                    slotMaxTime="18:00:00"
                    slotDuration={isMobileView ? '01:00:00' : '02:00:00'}
                    allDaySlot={false}
                    height="auto"
                    locale="fr"
                    firstDay={1}
                    buttonText={{
                        today: 'Aujourd\'hui',
                        month: 'Mois',
                        week: 'Semaine',
                        day: 'Jour'
                    }}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: false
                    }}
                    slotLabelFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: false
                    }}
                    datesSet={(info) => {
                        setSelectedDate(info.start.toISOString().split('T')[0]);
                    }}
                    dateClick={isProfesseur ? undefined : handleDateClick}
                    eventClick={handleEventClick}
                    eventDrop={isProfesseur ? undefined : handleEventDrop}
                    select={isProfesseur ? undefined : handleSelect}
                    eventContent={(arg) => {
                        const props = arg.event.extendedProps;
                        const seance = props?.extendedProps || props;
                        const details = [];
                        if (seance?.classe) details.push(seance.classe);
                        if (seance?.professeur) details.push(seance.professeur);
                        if (seance?.salle) details.push(seance.salle);
                        return (
                            <div style={{
                                padding: '2px 4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                <div style={{ fontWeight: '600', fontSize: '10px' }}>{arg.event.title}</div>
                                {details.length > 0 && (
                                    <div style={{ fontSize: '8px', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {details.join(' | ')}
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />
            </div>

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
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                                {editingSessionId ? 'Modifier la séance' : 'Nouvelle séance'}
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
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formState.date}
                                    onChange={(e) => setFormState(prev => ({ ...prev, date: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        outline: 'none',
                                        color: '#1a202c',
                                        background: 'white'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Heure début</label>
                                    <input
                                        type="time"
                                        required
                                        value={formState.startHour}
                                        onChange={(e) => setFormState(prev => ({ ...prev, startHour: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            border: '1.5px solid #e2e8f0',
                                            fontSize: '14px',
                                            outline: 'none',
                                            color: '#1a202c',
                                            background: 'white'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Heure fin</label>
                                    <input
                                        type="time"
                                        required
                                        value={formState.endHour}
                                        onChange={(e) => setFormState(prev => ({ ...prev, endHour: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            border: '1.5px solid #e2e8f0',
                                            fontSize: '14px',
                                            outline: 'none',
                                            color: '#1a202c',
                                            background: 'white'
                                        }}
                                    />
                                </div>
                            </div>

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
                                        cursor: 'pointer',
                                        color: '#1a202c'
                                    }}
                                >
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
                                    onChange={(e) => applyCourseSelection(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        background: 'white',
                                        cursor: 'pointer',
                                        color: '#1a202c'
                                    }}
                                >
                                    <option value="">Sélectionner un cours</option>
                                    {courses.map(cours => (
                                        <option key={cours.id} value={cours.id}>{cours.libelle}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Professeur</label>
                                <select
                                    name="professeur"
                                    value={effectiveProfessorId}
                                    onChange={(e) => setFormState(prev => ({ ...prev, professeurId: e.target.value }))}
                                    disabled={isProfessorLockedByCourse}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        background: isProfessorLockedByCourse ? '#f1f5f9' : 'white',
                                        cursor: isProfessorLockedByCourse ? 'not-allowed' : 'pointer',
                                        color: '#1a202c'
                                    }}
                                >
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
                                <select
                                    name="salle"
                                    required
                                    value={formState.salleId}
                                    onChange={(e) => setFormState(prev => ({ ...prev, salleId: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        background: 'white',
                                        cursor: 'pointer',
                                        color: '#1a202c'
                                    }}
                                >
                                    <option value="">Sélectionner une salle</option>
                                    {salles.map(salle => (
                                        <option key={salle.id} value={salle.id}>{salle.libelle}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                {editingSessionId && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteSeance(editingSessionId)}
                                        disabled={isMutating}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: '#fee2e2',
                                            color: '#dc2626',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            opacity: isMutating ? 0.7 : 1
                                        }}
                                    >
                                        Supprimer
                                    </button>
                                )}
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
                                    {editingSessionId ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

