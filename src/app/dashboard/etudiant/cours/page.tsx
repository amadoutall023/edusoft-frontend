'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, User, Clock, Eye, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { etudiantActuel } from '@/modules/etudiant/data/etudiants';
import { fetchMyCours, CoursEtudiant } from '@/modules/etudiant/services/dashboardService';
import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, StudentResponseDto } from '@/shared/api/types';
import { mapStudentToEtudiant } from '@/modules/etudiant/data/etudiants';
import { useAuth } from '@/modules/auth/context/AuthContext';

export default function EtudiantCoursPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [selectedCours, setSelectedCours] = useState<string | null>(null);
    const [cours, setCours] = useState<CoursEtudiant[]>([]);
    const [etudiant, setEtudiant] = useState(etudiantActuel);
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

            // Charger les cours
            const coursList = await fetchMyCours();
            setCours(coursList);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculer les stats
    const totalHeures = cours.reduce((sum, c) => sum + c.totalHour, 0);
    const totalProfesseurs = new Set(cours.map(c => `${c.professorNom} ${c.professorPrenom}`)).size;

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
                    Mes Cours
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                    Classe: {etudiant.classe || 'Non assigné'}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                    <div className="absolute -top-5 -right-5 w-[80px] md:w-[100px] h-[80px] md:h-[100px] rounded-full blur-[20px]" style={{ backgroundColor: '#5B8DEF15' }} />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <div className="text-xs md:text-sm font-medium text-slate-500 mb-2 tracking-wide">Total cours</div>
                            <div className="text-2xl md:text-[36px] font-extrabold text-[#5B8DEF]">{cours.length}</div>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-[#5B8DEF]/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 md:w-7 md:h-7 text-[#5B8DEF]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                    <div className="absolute -top-5 -right-5 w-[80px] md:w-[100px] h-[80px] md:h-[100px] rounded-full blur-[20px]" style={{ backgroundColor: '#10b98115' }} />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <div className="text-xs md:text-sm font-medium text-slate-500 mb-2 tracking-wide">Heures totales</div>
                            <div className="text-2xl md:text-[36px] font-extrabold text-[#10b981]">{totalHeures}h</div>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 md:w-7 md:h-7 text-[#10b981]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                    <div className="absolute -top-5 -right-5 w-[80px] md:w-[100px] h-[80px] md:h-[100px] rounded-full blur-[20px]" style={{ backgroundColor: '#f59e0b15' }} />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <div className="text-xs md:text-sm font-medium text-slate-500 mb-2 tracking-wide">Professeurs</div>
                            <div className="text-2xl md:text-[36px] font-extrabold text-[#f59e0b]">{totalProfesseurs}</div>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
                            <User className="w-5 h-5 md:w-7 md:h-7 text-[#f59e0b]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses List */}
            <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Liste des cours</h2>
                {cours.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        Aucun cours trouvé pour votre classe
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cours.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedCours(selectedCours === c.id ? null : c.id)}
                                className="p-4 rounded-xl border border-slate-200 hover:shadow-md hover:border-[#5B8DEF]/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#5B8DEF]/10 flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-[#5B8DEF]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{c.libelle}</h3>
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    Pr. {c.professorPrenom} {c.professorNom}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {c.totalHour}h
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Eye className="w-5 h-5 text-slate-400" />
                                </div>

                                {/* Expanded details */}
                                {selectedCours === c.id && (
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-500">Module:</span>
                                                <span className="ml-2 font-medium text-slate-800">{c.moduleLibelle}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Heures réalisées:</span>
                                                <span className="ml-2 font-medium text-slate-800">{c.completedHour}h / {c.plannedHour}h</span>
                                            </div>
                                            {c.professorGrade && (
                                                <div className="col-span-2">
                                                    <span className="text-slate-500">Grade:</span>
                                                    <span className="ml-2 font-medium text-slate-800">{c.professorGrade}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Note: No create/edit/delete buttons for students */}
            <div className="bg-slate-50 rounded-xl p-4 text-center text-sm text-slate-500">
                <p>Vous pouvez uniquement consulter vos cours. Contactez votre attaché de classe pour toute modification.</p>
            </div>
        </div>
    );
}
