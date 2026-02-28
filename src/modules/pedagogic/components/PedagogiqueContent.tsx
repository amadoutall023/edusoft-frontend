'use client';

import React, { useEffect, useMemo, useState } from 'react';
import StatCard from './StatCard';
import ProgressionChart from './ProgressionChart';
import SessionsList from './SessionsList';
import AlertSession from './AlertSession';
import { StatistiqueDashboard, SessionAVenir, ProgressionCours, SessionAnnulee } from '../types';
import { fetchClasses, fetchFilieres } from '@/modules/structure/services/structureService';
import { fetchStudents } from '@/modules/etudiant/services/studentService';
import { fetchProfessors } from '@/modules/prof/services/professorService';
import { fetchSessions } from '@/modules/planning/services/sessionService';
import { SessionResponseDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';
import { useAuth } from '@/modules/auth/context/AuthContext';

const COLOR_BY_STATUS: Record<string, string> = {
    TERMINEE: '#10b981',
    EN_COURS: '#f59e0b',
    PROGRAMME: '#3b82f6',
    default: '#10b981'
};

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function PedagogiqueContent() {
    const { roles } = useAuth();
    const [stats, setStats] = useState<StatistiqueDashboard[]>([]);
    const [sessions, setSessions] = useState<SessionAVenir[]>([]);
    const [progression, setProgression] = useState<ProgressionCours[]>([]);
    const [alert, setAlert] = useState<SessionAnnulee | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const [
                    classesRes,
                    filieresRes,
                    studentsRes,
                    professorsRes,
                    sessionsRes
                ] = await Promise.all([
                    fetchClasses(500),
                    fetchFilieres(200),
                    fetchStudents(),
                    fetchProfessors(),
                    fetchSessions({ size: 400 })
                ]);

                setStats([
                    { titre: 'Nombre de classes', valeur: classesRes.length, icon: '📚', couleur: '#5B8DEF' },
                    { titre: "Nombre d'élèves", valeur: studentsRes.totalElements || studentsRes.content?.length || 0, icon: '🎓', couleur: '#10b981' },
                    { titre: 'Nombre de filières', valeur: filieresRes.length, icon: '📋', couleur: '#f59e0b' },
                    { titre: 'Professeurs actifs', valeur: professorsRes.length, icon: '👨‍🏫', couleur: '#8b5cf6' }
                ]);

                const sessionsData = sessionsRes.data ?? [];
                const upcomingSessions = buildUpcomingSessions(sessionsData);
                setSessions(upcomingSessions.slice(0, 6));

                setProgression(buildProgressionData(sessionsData));

                const overdueRaw = sessionsData
                    .filter(session => new Date(session.date) < new Date() && session.status === 'PROGRAMME')
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

                if (overdueRaw) {
                    setAlert({
                        cours: overdueRaw?.libelle ?? overdueRaw?.cours?.libelle ?? 'Session à replanifier',
                        niveau: overdueRaw?.classe?.libelle ?? overdueRaw?.classes?.[0]?.libelle ?? 'Classe',
                        professeur: overdueRaw?.professor
                            ? `${overdueRaw.professor.prenom ?? ''} ${overdueRaw.professor.nom ?? ''}`.trim() || 'Non assigné'
                            : 'Non assigné',
                        date: 'à reprogrammer'
                    });
                } else if (upcomingSessions[0]) {
                    setAlert({
                        cours: upcomingSessions[0].cours,
                        niveau: upcomingSessions[0].niveau,
                        professeur: upcomingSessions[0].professeur,
                        date: 'demain'
                    });
                } else {
                    setAlert(null);
                }

                setError(null);
            } catch (err) {
                console.error('Dashboard load error', err);
                setError(err instanceof ApiError ? err.message : 'Impossible de charger les indicateurs');
                setStats([]);
                setSessions([]);
                setProgression([]);
                setAlert(null);
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, []);

    const content = useMemo(() => {
        if (isLoading) {
            return (
                <div className="py-10 text-center text-slate-500">
                    Chargement des indicateurs...
                </div>
            );
        }

        if (error) {
            return (
                <div className="py-10 text-center text-red-500">
                    {error}
                </div>
            );
        }

        return (
            <>
                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                    {stats.map((stat, idx) => (
                        <StatCard key={idx} stat={stat} />
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="xl:col-span-8">
                        <ProgressionChart data={progression} />
                    </div>
                    <div className="xl:col-span-4">
                        <SessionsList sessions={sessions} />
                    </div>
                </div>

                {alert && (
                    <div className="mb-4 md:mb-6">
                        <AlertSession session={alert} />
                    </div>
                )}
            </>
        );
    }, [alert, error, isLoading, progression, sessions, stats]);

    const dashboardTitle = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPER_ADMIN')
        ? 'Administrateur'
        : 'Responsable Pédagogique';

    return (
        <>
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-[32px] font-extrabold text-[#1a202c] mb-2">
                    {dashboardTitle}
                </h1>
                <p className="text-sm md:text-[15px] text-slate-500">
                    Vue d&apos;ensemble de votre établissement
                </p>
            </div>
            {content}
        </>
    );
}

function buildUpcomingSessions(sessions: SessionResponseDto[]): SessionAVenir[] {
    const now = new Date();
    return sessions
        .filter(session => {
            const dateTime = new Date(`${session.date}T${session.startHour || '00:00'}`);
            return !Number.isNaN(dateTime.getTime()) && dateTime >= now;
        })
        .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startHour || '00:00'}`);
            const dateB = new Date(`${b.date}T${b.startHour || '00:00'}`);
            return dateA.getTime() - dateB.getTime();
        })
        .map(session => {
            const libelle = session.cours?.libelle ?? session.module?.libelle ?? session.libelle;
            const classe = session.classe?.libelle ?? session.classes?.[0]?.libelle ?? 'Multi-classes';
            const professeur = session.professor
                ? `${session.professor.prenom ?? ''} ${session.professor.nom ?? ''}`.trim() || 'Non assigné'
                : 'Non assigné';
            return {
                id: session.id,
                cours: libelle ?? 'Cours',
                niveau: `${classe}`,
                professeur,
                dateLabel: session.date,
                heureLabel: `${session.startHour} - ${session.endHour}`,
                couleur: COLOR_BY_STATUS[session.status ?? 'default'] ?? COLOR_BY_STATUS.default
            } as SessionAVenir;
        });
}

function buildProgressionData(sessions: SessionResponseDto[]): ProgressionCours[] {
    const now = new Date();
    const grouped: Record<string, ProgressionCours> = {};

    sessions.forEach(session => {
        const date = new Date(session.date);
        if (Number.isNaN(date.getTime())) {
            return;
        }
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!grouped[monthKey]) {
            grouped[monthKey] = {
                mois: `${MONTHS[date.getMonth()]}`,
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
