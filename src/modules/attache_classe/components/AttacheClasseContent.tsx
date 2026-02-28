'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/modules/pedagogic/components/StatCard';
import PerformanceChart from './PerformanceChart';
import CoursHeuresCard from './CoursHeuresCard';
import PresenceCard from './PresenceCard';
import SessionsList from '@/modules/pedagogic/components/SessionsList';
import AlertesAC from './AlertesAC';
import { StatistiqueDashboard, SessionAVenir, ProgressionCours } from '@/modules/pedagogic/types';
import { fetchClasses } from '@/modules/structure/services/structureService';
import { fetchSessions } from '@/modules/planning/services/sessionService';
import { fetchCourses } from '@/modules/cours/services/coursService';
import { fetchACAlerts, fetchDashboardACStats, fetchTodaySessions } from '../services/attacheService';
import { getSessionPresenceStats } from '@/modules/cours/services/presenceService';
import { CoursResponseDto, SessionResponseDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';

const COLOR_BY_STATUS: Record<string, string> = {
    TERMINEE: '#10b981',
    EN_COURS: '#f59e0b',
    PROGRAMME: '#3b82f6',
    ANNULE: '#ef4444',
    default: '#64748b'
};

const MONTHS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'];

type CoursHeureItem = {
    id: string;
    cours: string;
    classe: string;
    heuresPrevues: number;
    heuresFaites: number;
};

export default function AttacheClasseContent() {
    const [stats, setStats] = useState<StatistiqueDashboard[]>([]);
    const [sessions, setSessions] = useState<SessionAVenir[]>([]);
    const [progression, setProgression] = useState<ProgressionCours[]>([]);
    const [coursHeures, setCoursHeures] = useState<CoursHeureItem[]>([]);
    const [presenceData, setPresenceData] = useState({ present: 0, absent: 0, total: 0 });
    const [alertes, setAlertes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const [
                    classesRes,
                    sessionsRes,
                    coursRes,
                    acStatsRes,
                    todaySessionsRes,
                    alertsRes
                ] = await Promise.all([
                    fetchClasses(500),
                    fetchSessions({ size: 500 }),
                    fetchCourses({ size: 200 }),
                    fetchDashboardACStats(),
                    fetchTodaySessions(),
                    fetchACAlerts()
                ]);

                const sessionsData = sessionsRes.data ?? [];

                setStats([
                    { titre: 'Nombre de classes', valeur: classesRes.length, icon: '📚', couleur: '#5B8DEF' },
                    { titre: "Eleves inscrits", valeur: acStatsRes.etudiantsInscrits, icon: '🎓', couleur: '#10b981' },
                    { titre: "Cours aujourd'hui", valeur: acStatsRes.coursAujourdhui, icon: '🗓️', couleur: '#f59e0b' },
                    { titre: "Absences aujourd'hui", valeur: acStatsRes.absencesAujourdhui, icon: '⚠️', couleur: '#ef4444' }
                ]);

                setSessions(buildUpcomingSessions(sessionsData).slice(0, 6));
                setProgression(buildProgressionData(sessionsData));
                setCoursHeures(buildCoursHeuresData(coursRes));
                setPresenceData(await buildPresenceDataFromTodaySessions(todaySessionsRes));
                setAlertes(alertsRes.length > 0 ? alertsRes : ['Aucune alerte pour le moment.']);

                setError(null);
            } catch (err) {
                console.error('Dashboard AC load error', err);
                setError(err instanceof ApiError ? err.message : 'Impossible de charger les indicateurs');
                setStats([]);
                setSessions([]);
                setProgression([]);
                setCoursHeures([]);
                setPresenceData({ present: 0, absent: 0, total: 0 });
                setAlertes(['Impossible de charger les alertes.']);
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, []);

    return (
        <>
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-[32px] font-extrabold text-[#1a202c] mb-2">Attache de Classe</h1>
                <p className="text-sm md:text-[15px] text-slate-500">Vue d&apos;ensemble de votre etablissement</p>
            </div>
            {isLoading ? (
                <div className="py-10 text-center text-slate-500">Chargement des indicateurs...</div>
            ) : error ? (
                <div className="py-10 text-center text-red-500">{error}</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                        {stats.map((stat, idx) => (
                            <StatCard key={idx} stat={stat} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 mb-6 md:mb-8">
                        <div className="xl:col-span-8">
                            <PerformanceChart data={progression} />
                        </div>
                        <div className="xl:col-span-4">
                            <SessionsList sessions={sessions} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                        <CoursHeuresCard cours={coursHeures} />
                        <PresenceCard data={presenceData} />
                    </div>

                    <div className="mb-4 md:mb-6">
                        <AlertesAC alertes={alertes} />
                    </div>
                </>
            )}
        </>
    );
}

function buildUpcomingSessions(sessions: SessionResponseDto[]): SessionAVenir[] {
    const now = new Date();
    return sessions
        .filter((session) => {
            const date = new Date(session.date);
            return !Number.isNaN(date.getTime()) && date >= now;
        })
        .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startHour || '00:00'}`);
            const dateB = new Date(`${b.date}T${b.startHour || '00:00'}`);
            return dateA.getTime() - dateB.getTime();
        })
        .map((session) => {
            const libelle = session.cours?.libelle ?? session.module?.libelle ?? session.libelle ?? 'Session';
            const classe = session.classe?.libelle ?? session.classes?.[0]?.libelle ?? 'Multi-classes';
            const professeur = session.professor
                ? `${session.professor.prenom ?? ''} ${session.professor.nom ?? ''}`.trim() || 'Non assigne'
                : 'Non assigne';
            return {
                id: session.id,
                cours: libelle,
                niveau: classe,
                professeur,
                dateLabel: session.date,
                heureLabel: `${session.startHour} - ${session.endHour}`,
                couleur: COLOR_BY_STATUS[session.status ?? 'default'] ?? COLOR_BY_STATUS.default
            };
        });
}

function buildProgressionData(sessions: SessionResponseDto[]): ProgressionCours[] {
    const now = new Date();
    const grouped: Record<string, ProgressionCours> = {};

    sessions.forEach((session) => {
        const date = new Date(session.date);
        if (Number.isNaN(date.getTime())) {
            return;
        }
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!grouped[monthKey]) {
            grouped[monthKey] = {
                mois: MONTHS[date.getMonth()],
                enRetard: 0,
                attention: 0,
                enCours: 0,
                termine: 0
            };
        }
        if (session.status === 'TERMINEE') {
            grouped[monthKey].termine += 1;
        } else if (session.status === 'EN_COURS') {
            grouped[monthKey].attention += 1;
        } else if (session.status === 'PROGRAMME') {
            if (date < now) {
                grouped[monthKey].enRetard += 1;
            } else {
                grouped[monthKey].enCours += 1;
            }
        }
    });

    return Object.entries(grouped)
        .sort((a, b) => (a[0] > b[0] ? 1 : -1))
        .map(([, value]) => value)
        .slice(-9);
}

function buildCoursHeuresData(cours: CoursResponseDto[]): CoursHeureItem[] {
    if (!cours || cours.length === 0) {
        return [];
    }

    return cours.map((c) => ({
        id: c.id,
        cours: c.libelle ?? 'Cours',
        classe: c.classes?.map((cl) => cl.libelle).join(' / ') || 'Classe',
        heuresPrevues: c.plannedHour ?? 0,
        heuresFaites: c.completedHour ?? 0
    }));
}

async function buildPresenceDataFromTodaySessions(todaySessions: Array<{ id: string }>): Promise<{ present: number; absent: number; total: number }> {
    if (!todaySessions || todaySessions.length === 0) {
        return { present: 0, absent: 0, total: 0 };
    }

    const stats = await Promise.allSettled(todaySessions.map((session) => getSessionPresenceStats(session.id)));

    let present = 0;
    let absent = 0;
    let total = 0;

    stats.forEach((result) => {
        if (result.status === 'fulfilled') {
            present += result.value.presents ?? 0;
            absent += result.value.absents ?? 0;
            total += result.value.total ?? 0;
        }
    });

    return { present, absent, total };
}
