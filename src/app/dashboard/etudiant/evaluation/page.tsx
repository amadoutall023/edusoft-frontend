'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { etudiantActuel } from '@/modules/etudiant/data/etudiants';
import { fetchMyEvaluations, fetchMyNotes, EvaluationEtudiant } from '@/modules/etudiant/services/dashboardService';
import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, StudentResponseDto } from '@/shared/api/types';
import { mapStudentToEtudiant } from '@/modules/etudiant/data/etudiants';
import { useAuth } from '@/modules/auth/context/AuthContext';

type FilterType = 'all' | 'module' | 'professor';

export default function EtudiantEvaluationPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [selectedModule, setSelectedModule] = useState<string>('all');
    const [selectedProfessor, setSelectedProfessor] = useState<string>('all');
    const [evaluations, setEvaluations] = useState<EvaluationEtudiant[]>([]);
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

            // Charger les evaluations
            const evaluationsData = await fetchMyEvaluations();
            setEvaluations(evaluationsData);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get unique modules and professors
    const modules = [...new Set(evaluations.map(e => e.moduleLibelle).filter(Boolean))];
    const professors = [...new Set(evaluations
        .map(e => {
            const fullName = `${e.professorPrenom || ''} ${e.professorNom || ''}`.trim();
            return fullName || 'Professeur';
        })
    )];

    // Filter evaluations
    const filteredEvaluations = evaluations.filter(eval_ => {
        if (selectedModule !== 'all' && eval_.moduleLibelle !== selectedModule) return false;
        const fullProfessorName = `${eval_.professorPrenom || ''} ${eval_.professorNom || ''}`.trim() || 'Professeur';
        if (selectedProfessor !== 'all' && fullProfessorName !== selectedProfessor) return false;
        return true;
    });

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
                    Mes Évaluations
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                    Classe: {etudiant.classe || 'Non assigné'}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:gap-6">
                <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                    <div className="absolute -top-5 -right-5 w-[80px] md:w-[100px] h-[80px] md:h-[100px] rounded-full blur-[20px]" style={{ backgroundColor: '#10b98115' }} />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <div className="text-xs md:text-sm font-medium text-slate-500 mb-2 tracking-wide">Évaluations</div>
                            <div className="text-2xl md:text-[36px] font-extrabold text-[#10b981]">{filteredEvaluations.length}</div>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 md:w-7 md:h-7 text-[#10b981]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Filtrer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <BookOpen className="w-4 h-4 inline mr-2" />
                            Par module
                        </label>
                        <select
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B8DEF] focus:border-transparent"
                        >
                            <option value="all">Tous les modules</option>
                            {modules.map(module => (
                                <option key={module} value={module}>{module}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Par professeur
                        </label>
                        <select
                            value={selectedProfessor}
                            onChange={(e) => setSelectedProfessor(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B8DEF] focus:border-transparent"
                        >
                            <option value="all">Tous les professeurs</option>
                            {professors.map(prof => (
                                <option key={prof} value={prof}>Pr. {prof}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Evaluations List */}
            <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Historique des évaluations</h2>
                {filteredEvaluations.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        Aucune évaluation trouvée
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Module</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvaluations.map(eval_ => (
                                    <tr key={eval_.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-slate-800 font-medium">{eval_.moduleLibelle}</td>
                                        <td className="py-3 px-4 text-slate-600">{eval_.sessionDate}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${eval_.typeSession === 'EVALUATION'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-[#5B8DEF]/10 text-[#5B8DEF]'
                                                }`}>
                                                {eval_.typeSession === 'EVALUATION' ? 'Examen' : 'Devoir'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
