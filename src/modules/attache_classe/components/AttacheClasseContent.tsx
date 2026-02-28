'use client';

import React, { useState, useEffect } from 'react';
import StatCard from '@/modules/pedagogic/components/StatCard';
import PerformanceChart from '../components/PerformanceChart';
import CoursHeuresCard from '../components/CoursHeuresCard';
import PresenceCard from '../components/PresenceCard';
import SessionsList from '@/modules/pedagogic/components/SessionsList';
import AlertSession from '@/modules/pedagogic/components/AlertSession';
import {
    statistiques as statistiquesFallback,
    sessionsAVenir as sessionsFallback,
    progressionMensuelle as progressionFallback,
    sessionAnnulee as sessionAnnuleeFallback
} from '@/modules/pedagogic/data/dashboard';
import { StatistiqueDashboard, SessionAVenir, ProgressionCours, SessionAnnulee } from '@/modules/pedagogic/types';
import { fetchClasses, fetchFilieres } from '@/modules/structure/services/structureService';
import { fetchStudents } from '@/modules/etudiant/services/studentService';
import { fetchProfessors } from '@/modules/prof/services/professorService';
import { fetchSessions } from '@/modules/planning/services/sessionService';
import { fetchCourses } from '@/modules/cours/services/coursService';
import { fetchACAlerts } from '../services/attacheService';
import { SessionResponseDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';

const COLOR_BY_STATUS: Record<string, string> = {
    TERMINEE: '#10b981',
    EN_COURS: '#f59e0b',
    PROGRAMME: '#3b82f6',
    default: '#10b981'
};

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function AttacheClasseContent() {
    const [stats, setStats] = useState<StatistiqueDashboard[]>(statistiquesFallback);
    const [sessions, setSessions] = useState<SessionAVenir[]>(sessionsFallback);
    const [progression, setProgression] = useState<ProgressionCours[]>(progressionFallback);
    const [coursHeures, setCoursHeures] = useState<{ id: string; cours: string; classe: string; heuresPrevues: number; heuresFaites: number }[]>([]);
    const [presenceData, setPresenceData] = useState({ present: 0, absent: 0, total: 0 });
    const [alert, setAlert] = useState<SessionAnnulee>(sessionAnnuleeFallback);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alertes, setAlertes] = useState<string[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);

                // Charger les données pédagogiques (comme RP)
                const [
                    classesRes,
                    filieresRes,
                    studentsRes,
                    professorsRes,
                    sessionsRes,
                    coursRes
                ] = await Promise.all([
                    fetchClasses(500),
                    fetchFilieres(200),
                    fetchStudents(),
                    fetchProfessors(),
                    fetchSessions({ size: 400 }),
                    fetchCourses({ size: 100 })
                ]);

                // Charger les alertes AC
                try {
                    const alertsRes = await fetchACAlerts();
                    setAlertes(alertsRes);
                } catch (alertError) {
                    console.error('Erreur alertes:', alertError);
                    setAlertes([]);
                }

                // Statistiques identiques au RP
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
                setCoursHeures(buildCoursHeuresData(sessionsData, coursRes));
                setPresenceData(buildPresenceData(sessionsData));

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
                }

                setError(null);
            } catch (err) {
                console.error('Dashboard load error', err);
                setError(err instanceof ApiError ? err.message : 'Impossible de charger les indicateurs');
                setStats(statistiquesFallback);
                setSessions(sessionsFallback);
                setProgression(progressionFallback);
                setCoursHeures([]);
                setPresenceData({ present: 0, absent: 0, total: 0 });
                setAlert(sessionAnnuleeFallback);
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, []);

    const content = (
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
                    <PerformanceChart data={progression} />
                </div>
                <div className="xl:col-span-4">
                    <SessionsList sessions={sessions} />
                </div>
            </div>

            {/* Heures de cours et Présences */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <CoursHeuresCard cours={coursHeures} />
                <PresenceCard data={presenceData} />
            </div>

            {/* Alert */}
            <div className="mb-4 md:mb-6">
                <AlertSession session={alert} />
            </div>
        </>
    );

    return (
        <>
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-[32px] font-extrabold text-[#1a202c] mb-2">
                    Attaché de Classe
                </h1>
                <p className="text-sm md:text-[15px] text-slate-500">
                    Vue d'ensemble de votre établissement
                </p>
            </div>
            {isLoading ? (
                <div className="py-10 text-center text-slate-500">
                    Chargement des indicateurs...
                </div>
            ) : error ? (
                <div className="py-10 text-center text-red-500">
                    {error}
                </div>
            ) : (
                content
            )}
        </>
    );
}

function buildUpcomingSessions(sessions: SessionResponseDto[]): SessionAVenir[] {
    const now = new Date();
    return sessions
        .filter(session => {
            const date = new Date(session.date);
            return !Number.isNaN(date.getTime()) && date >= now;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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
                couleur: COLOR_BY_STATUS[session.status ?? 'default'] ?? COLOR_BY_STATUS.default
            } as SessionAVenir;
        });
}

function buildProgressionData(sessions: SessionResponseDto[]): ProgressionCours[] {
    const now = new Date();
    const grouped: Record<string, ProgressionCours> = {};

    sessions.forEach(session => {
        const date = new Date(session.date);
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

function buildCoursHeuresData(sessions: SessionResponseDto[], cours: any[]): { id: string; cours: string; classe: string; heuresPrevues: number; heuresFaites: number }[] {
    // Si on a des données de cours du backend, les utiliser
    if (cours && cours.length > 0) {
        return cours.slice(0, 6).map((c: any) => ({
            id: c.id ?? c.libelle,
            cours: c.libelle ?? 'Cours',
            classe: c.classe?.libelle ?? c.classe ?? 'Classe',
            heuresPrevues: c.plannedHour ?? c.totalHour ?? 0,
            heuresFaites: c.totalHour ? Math.floor(c.totalHour * 0.7) : 0 // Simulation: 70% fait
        }));
    }

    // Sinon, utiliser les sessions
    const grouped: Record<string, { id: string; cours: string; classe: string; heuresPrevues: number; heuresFaites: number }> = {};

    sessions.forEach(session => {
        const libelle = session.cours?.libelle ?? session.module?.libelle ?? session.libelle ?? 'Cours';
        const classe = session.classe?.libelle ?? session.classes?.[0]?.libelle ?? 'Classe';
        const key = `${libelle}-${classe}`;

        // Calculer la durée prévue (en heures)
        const duration = session.duration ? session.duration / 60 : 1;
        const estTerminee = session.status === 'TERMINEE';
        const estEnCours = session.status === 'EN_COURS';

        if (!grouped[key]) {
            grouped[key] = {
                id: session.id ?? key,
                cours: libelle,
                classe: classe,
                heuresPrevues: 0,
                heuresFaites: 0
            };
        }

        grouped[key].heuresPrevues += duration;
        if (estTerminee) {
            grouped[key].heuresFaites += duration;
        } else if (estEnCours) {
            grouped[key].heuresFaites += duration * 0.5; // 50% fait si en cours
        }
    });

    return Object.values(grouped).slice(0, 6);
}

function buildPresenceData(sessions: SessionResponseDto[]): { present: number; absent: number; total: number } {
    // Compter les présences basées sur les sessions d'aujourd'hui
    const today = new Date();
    const todaySessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === today.toDateString();
    });

    // Simulation: on prend le nombre d'étudiants comme total et on calcule les absences
    // En réalité, cela viendrait des données de présence
    const total = todaySessions.length * 20; // Simulation
    const absent = Math.floor(total * 0.1); // 10% d'absences simulées
    const present = total - absent;

    return { present, absent, total };
}
