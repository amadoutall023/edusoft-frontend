'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, ClipboardList, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { fetchCourses } from '@/modules/cours/services/coursService';
import { fetchSessions } from '@/modules/planning/services/sessionService';
import { fetchEvaluations } from '@/modules/evaluation/services/evaluationService';
import { CoursResponseDto, SessionResponseDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';

interface StatCard {
    titre: string;
    valeur: number | string;
    icon: string;
    couleur: string;
}

export default function ProfessorDashboardContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [stats, setStats] = useState<StatCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [todaySessions, setTodaySessions] = useState<SessionResponseDto[]>([]);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setIsLoading(true);
                
                // Fetch professor's courses (filtered by user ID - backend should handle this)
                const coursesRes = await fetchCourses({ page: 0, size: 100 });
                
                // Fetch professor's sessions
                const sessionsRes = await fetchSessions({ page: 0, size: 200 });
                
                // Fetch evaluations
                const evaluationsRes = await fetchEvaluations({ page: 0, size: 100 });

                // Calculate stats
                const myCourses = coursesRes; // Backend should filter by professor
                const mySessions = sessionsRes.data || [];
                
                // Today's sessions
                const today = new Date().toISOString().split('T')[0];
                const todaySessionsList = mySessions.filter(s => s.date === today);
                
                // Upcoming sessions (next 7 days)
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                const upcomingSessions = mySessions.filter(s => {
                    const sessionDate = new Date(s.date);
                    return sessionDate >= new Date() && sessionDate <= nextWeek;
                });

                // Pending evaluations (to grade)
                const evaluations = evaluationsRes.evaluations || [];
                const pendingGrades = evaluations.filter(e => 
                    e.statutNote === 'A deposer' || e.statutNote === 'Note en retard'
                );

                setStats([
                    { 
                        titre: 'Mes cours', 
                        valeur: myCourses.length, 
                        icon: '📚', 
                        couleur: '#5B8DEF' 
                    },
                    { 
                        titre: "Séances aujourd'hui", 
                        valeur: todaySessionsList.length, 
                        icon: '📅', 
                        couleur: '#10b981' 
                    },
                    { 
                        titre: 'Séances à venir', 
                        valeur: upcomingSessions.length, 
                        icon: '⏰', 
                        couleur: '#f59e0b' 
                    },
                    { 
                        titre: 'Évaluations à noter', 
                        valeur: pendingGrades.length, 
                        icon: '📝', 
                        couleur: '#8b5cf6' 
                    }
                ]);

                setTodaySessions(todaySessionsList);
                setError(null);
            } catch (err) {
                console.error('Professor dashboard load error', err);
                setError(err instanceof ApiError ? err.message : 'Impossible de charger le tableau de bord');
                // Fallback stats
                setStats([
                    { titre: 'Mes cours', valeur: 0, icon: '📚', couleur: '#5B8DEF' },
                    { titre: "Séances aujourd'hui", valeur: 0, icon: '📅', couleur: '#10b981' },
                    { titre: 'Séances à venir', valeur: 0, icon: '⏰', couleur: '#f59e0b' },
                    { titre: 'Évaluations à noter', valeur: 0, icon: '📝', couleur: '#8b5cf6' }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        void loadDashboard();
    }, []);

    const navigateTo = (path: string) => {
        router.push(path);
    };

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[#5B8DEF] to-[#4169B8] rounded-xl md:rounded-[20px] p-6 md:p-8 text-white shadow-lg">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Bonjour, {user?.firstName || 'Professeur'} {user?.lastName || ''}
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                    Voici un aperçu de votre activité pédagogique
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                    <div 
                        key={index}
                        className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] cursor-pointer"
                        onClick={() => {
                            if (stat.titre === 'Mes cours') navigateTo('/dashboard/prof/cours');
                            if (stat.titre === 'Évaluations à noter') navigateTo('/dashboard/prof/evaluations');
                            if (stat.titre.includes('Séances')) navigateTo('/dashboard/prof/planning');
                        }}
                    >
                        <div 
                            className="absolute -top-5 -right-5 w-[80px] md:w-[100px] h-[80px] md:h-[100px] rounded-full blur-[20px]"
                            style={{ backgroundColor: `${stat.couleur}15` }}
                        />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex-1">
                                <div className="text-xs md:text-sm font-medium text-slate-500 mb-2 md:mb-3 tracking-wide">
                                    {stat.titre}
                                </div>
                                <div 
                                    className="text-2xl md:text-[36px] font-extrabold leading-none"
                                    style={{ color: stat.couleur, letterSpacing: '-1px' }}
                                >
                                    {stat.valeur}
                                </div>
                            </div>
                            <div 
                                className="w-10 h-10 md:w-16 md:h-16 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${stat.couleur}15` }}
                            >
                                <BookOpen className="w-5 h-5 md:w-8 md:h-8" color={stat.couleur} strokeWidth={2} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl md:rounded-[20px] p-6 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-6">Accès rapide</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigateTo('/dashboard/prof/cours')}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#5B8DEF] hover:bg-[#5B8DEF]/5 transition-all duration-200 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-[#5B8DEF]/10 flex items-center justify-center group-hover:bg-[#5B8DEF] transition-colors">
                            <BookOpen className="w-6 h-6 text-[#5B8DEF] group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-slate-800">Mes cours</div>
                            <div className="text-sm text-slate-500">Consulter mes cours</div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigateTo('/dashboard/prof/planning')}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#10b981] hover:bg-[#10b981]/5 transition-all duration-200 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center group-hover:bg-[#10b981] transition-colors">
                            <Calendar className="w-6 h-6 text-[#10b981] group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-slate-800">Mon planning</div>
                            <div className="text-sm text-slate-500">Voir mon emploi du temps</div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigateTo('/dashboard/prof/evaluations')}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/5 transition-all duration-200 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center group-hover:bg-[#8b5cf6] transition-colors">
                            <ClipboardList className="w-6 h-6 text-[#8b5cf6] group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-slate-800">Mes évaluations</div>
                            <div className="text-sm text-slate-500">Saisir mes notes</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Today's Sessions */}
            {todaySessions.length > 0 && (
                <div className="bg-white rounded-xl md:rounded-[20px] p-6 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                    <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#5B8DEF]" />
                        Séances du jour
                    </h2>
                    <div className="space-y-3">
                        {todaySessions.map((session, index) => (
                            <div 
                                key={index}
                                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#5B8DEF]/10 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-[#5B8DEF]" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800">
                                            {session.libelle}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {session.classe?.libelle || session.classes?.[0]?.libelle || 'Classe'} • {session.startHour} - {session.endHour}
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    session.status === 'TERMINEE' ? 'bg-green-100 text-green-700' :
                                    session.status === 'EN_COURS' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {session.status === 'TERMINEE' ? 'Terminée' :
                                     session.status === 'EN_COURS' ? 'En cours' :
                                     session.status === 'PROGRAMME' ? 'Programmée' : session.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B8DEF]"></div>
                </div>
            )}
        </div>
    );
}
