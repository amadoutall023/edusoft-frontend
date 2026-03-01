'use client';

import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Calendar, BookOpen, User, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { etudiantActuel } from '@/modules/etudiant/data/etudiants';
import { fetchMySessions } from '@/modules/etudiant/services/dashboardService';
import { SessionResponseDto } from '@/shared/api/types';
import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, StudentResponseDto } from '@/shared/api/types';
import { mapStudentToEtudiant } from '@/modules/etudiant/data/etudiants';
import { useAuth } from '@/modules/auth/context/AuthContext';
import Swal from 'sweetalert2';

type SessionFilterType = 'all' | 'COURS' | 'EVALUATION' | 'AUTRE';

export default function EtudiantPlanningPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [sessionType, setSessionType] = useState<SessionFilterType>('all');
    const [events, setEvents] = useState<any[]>([]);
    const [sessions, setSessions] = useState<SessionResponseDto[]>([]);
    const [etudiant, setEtudiant] = useState(etudiantActuel);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Week navigation state
    const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        return monday.toISOString().split('T')[0];
    });

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Filter sessions by type
    const filteredSessions = useMemo(() => {
        if (sessionType === 'all') return sessions;
        return sessions.filter(s => s.typeSession === sessionType);
    }, [sessionType, sessions]);

    // Get week dates (Monday to Sunday)
    const weekDates = useMemo(() => {
        const start = new Date(currentWeekStart + 'T00:00:00');
        const dates: string[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    }, [currentWeekStart]);

    // Group sessions by date for mobile view
    const sessionsByDate = useMemo(() => {
        const grouped: Record<string, SessionResponseDto[]> = {};

        // Only include sessions from the current week
        filteredSessions.forEach(session => {
            if (weekDates.includes(session.date)) {
                const dateKey = session.date;
                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(session);
            }
        });

        // Sort sessions within each day by start time
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => a.startHour.localeCompare(b.startHour));
        });

        return grouped;
    }, [filteredSessions, weekDates]);

    // Get dates that have sessions
    const datesWithSessions = useMemo(() => {
        return weekDates.filter(date => sessionsByDate[date]?.length > 0);
    }, [weekDates, sessionsByDate]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        // Filter sessions based on type
        if (sessionType === 'all') {
            setEvents(sessionsToEvents(sessions));
        } else {
            setEvents(sessionsToEvents(sessions.filter(s => s.typeSession === sessionType)));
        }
    }, [sessionType, sessions]);

    const loadData = async () => {
        try {
            setIsLoading(true);

            // Charger les infos de l'étudiant
            const studentResponse = await httpClient<ApiResponse<StudentResponseDto | null>>(
                '/api/v1/students/me',
                { suppressErrorLog: true }
            );

            if (studentResponse.data) {
                const mappedEtudiant = mapStudentToEtudiant(studentResponse.data);
                setEtudiant({
                    ...mappedEtudiant,
                    firstName: user?.firstName || mappedEtudiant.firstName,
                    lastName: user?.lastName || mappedEtudiant.lastName
                });
            }

            // Charger les sessions
            const sessionsList = await fetchMySessions();
            setSessions(sessionsList);
            setEvents(sessionsToEvents(sessionsList));
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sessionsToEvents = (sessions: SessionResponseDto[]): any[] => {
        return sessions.map(session => {
            let backgroundColor = '#5B8DEF';
            if (session.typeSession === 'EVALUATION') {
                backgroundColor = '#10b981';
            } else if (session.typeSession === 'AUTRE') {
                backgroundColor = '#f59e0b';
            }

            return {
                id: session.id,
                title: session.libelle,
                start: `${session.date}T${session.startHour}`,
                end: `${session.date}T${session.endHour}`,
                backgroundColor,
                borderColor: backgroundColor,
                type: session.typeSession,
                extendedProps: {
                    module: session.module?.libelle,
                    professor: session.professor ? `Pr. ${session.professor.prenom} ${session.professor.nom}` : undefined,
                    salle: session.salle?.libelle,
                    status: session.status,
                    classe: session.classe?.libelle
                }
            };
        });
    };

    const handleEventClick = (info: any) => {
        const props = info.event.extendedProps;
        const eventDetails = `
            <div style="text-align: left; padding: 10px;">
                <p style="margin: 5px 0;"><strong>Module:</strong> ${props.module || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Professeur:</strong> ${props.professor || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Salle:</strong> ${props.salle || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Classe:</strong> ${props.classe || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Statut:</strong> ${props.status || 'N/A'}</p>
            </div>
        `;

        Swal.fire({
            title: info.event.title,
            html: eventDetails,
            icon: 'info',
            confirmButtonText: 'Fermer',
            confirmButtonColor: '#5B8DEF',
            width: isMobile ? '90%' : '500px'
        });
    };

    // Navigation functions for mobile week view
    const goToPreviousWeek = () => {
        const start = new Date(currentWeekStart + 'T00:00:00');
        start.setDate(start.getDate() - 7);
        setCurrentWeekStart(start.toISOString().split('T')[0]);
    };

    const goToNextWeek = () => {
        const start = new Date(currentWeekStart + 'T00:00:00');
        start.setDate(start.getDate() + 7);
        setCurrentWeekStart(start.toISOString().split('T')[0]);
    };

    const goToCurrentWeek = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        setCurrentWeekStart(monday.toISOString().split('T')[0]);
    };

    const formatWeekRange = () => {
        const start = new Date(currentWeekStart + 'T00:00:00');
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const startMonth = start.toLocaleDateString('fr-FR', { month: 'short' });
        const endMonth = end.toLocaleDateString('fr-FR', { month: 'short' });

        if (startMonth === endMonth) {
            return `${start.getDate()} - ${end.getDate()} ${startMonth}`;
        }
        return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}`;
    };

    const formatDayName = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    };

    const formatDayNumber = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.getDate();
    };

    const isToday = (dateStr: string) => {
        return dateStr === new Date().toISOString().split('T')[0];
    };

    // Get color based on session type
    const getSessionColor = (type: string): string => {
        switch (type) {
            case 'EVALUATION':
                return '#10B981';
            case 'AUTRE':
                return '#F59E0B';
            default:
                return '#5B8DEF';
        }
    };

    // Get type label in French
    const getTypeLabel = (type: string): string => {
        switch (type) {
            case 'COURS':
                return 'Cours';
            case 'EVALUATION':
                return 'Évaluation';
            case 'AUTRE':
                return 'Autre';
            default:
                return type;
        }
    };

    // Desktop header toolbar
    const desktopHeaderToolbar = useMemo(() => ({
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    }), []);

    // Mobile header toolbar - without list view to avoid cmdFormatter error
    const mobileHeaderToolbar = useMemo(() => ({
        left: 'prev,next today',
        center: 'title',
        right: ''
    }), []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#5B8DEF]" />
            </div>
        );
    }

    // Mobile view - FullCalendar List View
    if (isMobile) {
        return (
            <div className="space-y-4">
                {/* Bouton retour */}
                <button
                    onClick={() => router.push('/dashboard/etudiant')}
                    className="flex items-center gap-2 text-slate-600 hover:text-[#5B8DEF] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Retour</span>
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-[#5B8DEF] to-[#4169B8] rounded-xl p-5 text-white shadow-lg">
                    <h1 className="text-xl font-bold mb-1">Mon Planning</h1>
                    <p className="text-white/80 text-sm">{etudiant.classe || 'Non assigné'}</p>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-slate-100">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSessionType('all')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sessionType === 'all'
                                ? 'bg-[#5B8DEF] text-white'
                                : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            Tous
                        </button>
                        <button
                            onClick={() => setSessionType('COURS')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sessionType === 'COURS'
                                ? 'bg-[#5B8DEF] text-white'
                                : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            Cours
                        </button>
                        <button
                            onClick={() => setSessionType('EVALUATION')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sessionType === 'EVALUATION'
                                ? 'bg-[#10b981] text-white'
                                : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            Éval
                        </button>
                        <button
                            onClick={() => setSessionType('AUTRE')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sessionType === 'AUTRE'
                                ? 'bg-[#f59e0b] text-white'
                                : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            Autre
                        </button>
                    </div>
                </div>

                {/* Mobile Custom List View - FullCalendar List causes cmdFormatter error */}
                <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4">
                    {/* Week Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={goToPreviousWeek}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="text-center">
                            <span className="font-semibold text-slate-800">{formatWeekRange()}</span>
                        </div>
                        <button
                            onClick={goToNextWeek}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>

                    {/* Week days with sessions */}
                    <div className="space-y-4">
                        {weekDates.map((date) => {
                            const daySessions = sessionsByDate[date] || [];
                            const isCurrentDay = isToday(date);

                            return (
                                <div key={date} className={`${isCurrentDay ? 'bg-blue-50 rounded-lg p-3' : ''}`}>
                                    {/* Day Header */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`font-semibold ${isCurrentDay ? 'text-[#5B8DEF]' : 'text-slate-600'}`}>
                                            {formatDayName(date)}
                                        </span>
                                        <span className={`text-lg font-bold ${isCurrentDay ? 'text-[#5B8DEF]' : 'text-slate-800'}`}>
                                            {formatDayNumber(date)}
                                        </span>
                                        {isCurrentDay && (
                                            <span className="text-xs bg-[#5B8DEF] text-white px-2 py-0.5 rounded-full">
                                                Aujourd'hui
                                            </span>
                                        )}
                                    </div>

                                    {/* Sessions for this day */}
                                    {daySessions.length > 0 ? (
                                        <div className="space-y-2">
                                            {daySessions.map((session) => (
                                                <div
                                                    key={session.id}
                                                    className="p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow"
                                                    style={{
                                                        backgroundColor: 'white',
                                                        borderLeftColor: getSessionColor(session.typeSession)
                                                    }}
                                                    onClick={() => {
                                                        const props = {
                                                            module: session.module?.libelle,
                                                            professor: session.professor ? `Pr. ${session.professor.prenom} ${session.professor.nom}` : null,
                                                            salle: session.salle?.libelle,
                                                            classe: session.classe?.libelle,
                                                            status: session.status
                                                        };
                                                        const eventDetails = `
                                                            <div style="text-align: left; padding: 10px;">
                                                                <p style="margin: 5px 0;"><strong>Module:</strong> ${props.module || 'N/A'}</p>
                                                                <p style="margin: 5px 0;"><strong>Professeur:</strong> ${props.professor || 'N/A'}</p>
                                                                <p style="margin: 5px 0;"><strong>Salle:</strong> ${props.salle || 'N/A'}</p>
                                                                <p style="margin: 5px 0;"><strong>Classe:</strong> ${props.classe || 'N/A'}</p>
                                                                <p style="margin: 5px 0;"><strong>Statut:</strong> ${props.status || 'N/A'}</p>
                                                            </div>
                                                        `;
                                                        Swal.fire({
                                                            title: session.libelle,
                                                            html: eventDetails,
                                                            icon: 'info',
                                                            confirmButtonText: 'Fermer',
                                                            confirmButtonColor: '#5B8DEF',
                                                            width: '90%'
                                                        });
                                                    }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-slate-800">{session.libelle}</p>
                                                            <p className="text-sm text-slate-500">
                                                                {session.startHour} - {session.endHour}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className="text-xs px-2 py-1 rounded-full text-white"
                                                            style={{ backgroundColor: getSessionColor(session.typeSession) }}
                                                        >
                                                            {getTypeLabel(session.typeSession)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Aucun cours</p>
                                    )}
                                </div>
                            );
                        })}

                        {datesWithSessions.length === 0 && (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">Aucune session cette semaine</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-slate-100">
                    <h3 className="font-semibold text-slate-800 mb-3 text-sm">Légende</h3>
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-[#5B8DEF]"></div>
                            <span className="text-xs text-slate-600">Cours</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-[#10b981]"></div>
                            <span className="text-xs text-slate-600">Évaluation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-[#f59e0b]"></div>
                            <span className="text-xs text-slate-600">Autre</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop view - FullCalendar
    return (
        <div className="space-y-6">
            {/* Bouton retour */}
            <button
                onClick={() => router.push('/dashboard/etudiant')}
                className="flex items-center gap-2 text-slate-600 hover:text-[#5B8DEF] transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour au dashboard</span>
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#5B8DEF] to-[#4169B8] rounded-xl md:rounded-[20px] p-6 md:p-8 text-white shadow-lg">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Mon Planning
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                    Classe: {etudiant.classe || 'Non assigné'}
                </p>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Filtrer par type</h2>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setSessionType('all')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${sessionType === 'all'
                            ? 'bg-[#5B8DEF] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setSessionType('COURS')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${sessionType === 'COURS'
                            ? 'bg-[#5B8DEF] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Cours
                    </button>
                    <button
                        onClick={() => setSessionType('EVALUATION')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${sessionType === 'EVALUATION'
                            ? 'bg-[#10b981] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Évaluation
                    </button>
                    <button
                        onClick={() => setSessionType('AUTRE')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${sessionType === 'AUTRE'
                            ? 'bg-[#f59e0b] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Autre
                    </button>
                </div>
            </div>

            {/* Calendar - Desktop Version */}
            <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={desktopHeaderToolbar}
                    events={events}
                    locale="fr"
                    buttonText={{
                        today: "Aujourd'hui",
                        month: 'Mois',
                        week: 'Semaine',
                        day: 'Jour',
                        list: 'Liste'
                    }}
                    validRange={{
                        start: '2026-01-01',
                        end: '2026-12-31'
                    }}
                    allDaySlot={false}
                    slotMinTime="07:00:00"
                    slotMaxTime="20:00:00"
                    height="auto"
                    eventDisplay="block"
                    eventClick={handleEventClick}
                    nowIndicator={true}
                    stickyHeaderDates={true}
                    expandRows={true}
                    slotDuration="00:30:00"
                />
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Légende</h2>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-[#5B8DEF]"></div>
                        <span className="text-slate-600">Cours</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-[#10b981]"></div>
                        <span className="text-slate-600">Évaluation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-[#f59e0b]"></div>
                        <span className="text-slate-600">Autre</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
