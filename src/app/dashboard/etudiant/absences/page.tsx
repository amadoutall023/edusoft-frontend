'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, UserCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { etudiantActuel } from '@/modules/etudiant/data/etudiants';
import { fetchMyPresenceStats, fetchMyAbsences, StudentPresenceStats, StudentAbsenceRecord } from '@/modules/etudiant/services/dashboardService';
import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, StudentResponseDto } from '@/shared/api/types';
import { mapStudentToEtudiant } from '@/modules/etudiant/data/etudiants';
import { useAuth } from '@/modules/auth/context/AuthContext';

type FilterType = 'all' | 'absence' | 'retard';

export default function EtudiantAbsencesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [etudiant, setEtudiant] = useState(etudiantActuel);
    const [presenceStats, setPresenceStats] = useState<StudentPresenceStats | null>(null);
    const [absences, setAbsences] = useState<StudentAbsenceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

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

            // Charger les statistiques de présence
            const stats = await fetchMyPresenceStats();
            setPresenceStats(stats);

            // Charger les absences
            const absenceList = await fetchMyAbsences();
            setAbsences(absenceList);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter absences
    const filteredAbsences = absences.filter(absence => {
        if (filterType === 'all') return true;
        if (filterType === 'absence') return absence.status === 'ABSENT';
        if (filterType === 'retard') return absence.status === 'RETARD';
        return true;
    });

    // Calculate stats
    const totalAbsences = absences.filter(a => a.status === 'ABSENT').length;
    const totalRetards = absences.filter(a => a.status === 'RETARD' || a.status === 'EXCUSE').length;
    const totalHeures = absences.reduce((sum, a) => sum + a.hours, 0);
    const presenceRate = presenceStats?.presenceRate ?? 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#5B8DEF]" />
            </div>
        );
    }

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
                    Absences et Retards
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                    Classe: {etudiant.classe || 'Non assigné'}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                    <div className="absolute -top-5 -right-5 w-[80px] md:w-[100px] h-[80px] md:h-[100px] rounded-full blur-[20px]" style={{ backgroundColor: '#10b98115' }} />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <div className="text-xs md:text-sm font-medium text-slate-500 mb-2 tracking-wide">Présence</div>
                            <div className="text-2xl md:text-[36px] font-extrabold text-[#10b981]">{presenceRate > 0 ? `${presenceRate.toFixed(1)}%` : '—'}</div>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                            <UserCheck className="w-5 h-5 md:w-7 md:h-7 text-[#10b981]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                    <div className="absolute -top-5 -right-5 w-[80px] md:w-[100px] h-[80px] md:h-[100px] rounded-full blur-[20px]" style={{ backgroundColor: '#ef444415' }} />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <div className="text-xs md:text-sm font-medium text-slate-500 mb-2 tracking-wide">Absences</div>
                            <div className="text-2xl md:text-[36px] font-extrabold text-red-600">{presenceStats?.absentCount ?? totalAbsences}</div>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-red-100 flex items-center justify-center">
                            <XCircle className="w-5 h-5 md:w-7 md:h-7 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                    <div className="absolute -top-5 -right-5 w-[80px] md:w-[100px] h-[80px] md:h-[100px] rounded-full blur-[20px]" style={{ backgroundColor: '#f59e0b15' }} />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <div className="text-xs md:text-sm font-medium text-slate-500 mb-2 tracking-wide">Retards</div>
                            <div className="text-2xl md:text-[36px] font-extrabold text-[#f59e0b]">{presenceStats?.tardyCount ?? totalRetards}</div>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 md:w-7 md:h-7 text-[#f59e0b]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                    <div className="absolute -top-5 -right-5 w-[80px] md:w-[100px] h-[80px] md:h-[100px] rounded-full blur-[20px]" style={{ backgroundColor: '#5B8DEF15' }} />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <div className="text-xs md:text-sm font-medium text-slate-500 mb-2 tracking-wide">Heures</div>
                            <div className="text-2xl md:text-[36px] font-extrabold text-[#5B8DEF]">{totalHeures}h</div>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-[#5B8DEF]/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 md:w-7 md:h-7 text-[#5B8DEF]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Filtrer</h2>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${filterType === 'all'
                            ? 'bg-[#5B8DEF] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setFilterType('absence')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${filterType === 'absence'
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Absences
                    </button>
                    <button
                        onClick={() => setFilterType('retard')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${filterType === 'retard'
                            ? 'bg-[#f59e0b] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Retards
                    </button>
                </div>
            </div>

            {/* History List */}
            <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Historique</h2>
                {filteredAbsences.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        Aucune absence ou retard enregistré
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAbsences.map(absence => (
                            <div
                                key={absence.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:shadow-md hover:border-[#5B8DEF]/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${absence.status === 'ABSENT' ? 'bg-red-100' : 'bg-[#f59e0b]/10'
                                        }`}>
                                        {absence.status === 'ABSENT' ? (
                                            <XCircle className="w-6 h-6 text-red-600" />
                                        ) : (
                                            <Clock className="w-6 h-6 text-[#f59e0b]" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800">{absence.moduleLibelle}</div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            {absence.sessionDate}
                                            <span className="mx-1">•</span>
                                            <Clock className="w-4 h-4" />
                                            {absence.startHour} - {absence.endHour}
                                            <span className="mx-1">•</span>
                                            {absence.hours}h
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {absence.justifiee ? (
                                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] text-sm font-medium">
                                            <CheckCircle className="w-4 h-4" />
                                            Justifié
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                                            <XCircle className="w-4 h-4" />
                                            Non justifié
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
