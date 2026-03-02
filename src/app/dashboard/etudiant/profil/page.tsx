'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, BookOpen, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { etudiantActuel, mapStudentToEtudiant } from '@/modules/etudiant/data/etudiants';
import { fetchMyPresenceStats, StudentPresenceStats } from '@/modules/etudiant/services/dashboardService';
import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, StudentResponseDto } from '@/shared/api/types';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { Etudiant } from '@/modules/etudiant/types';

export default function EtudiantProfilPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [etudiant, setEtudiant] = useState<Etudiant>(etudiantActuel);
    const [presenceStats, setPresenceStats] = useState<StudentPresenceStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
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

            // Charger les stats de présence
            const stats = await fetchMyPresenceStats();
            setPresenceStats(stats);
        } catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
                    Mon Profil
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                    Vos informations personnelles
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl md:rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-r from-[#5B8DEF] to-[#4169B8]"></div>

                {/* Profile Info */}
                <div className="px-6 pb-6">
                    {/* Avatar */}
                    <div className="relative -mt-16 mb-4">
                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-bold">
                            {etudiant.firstName?.[0] || '?'}{etudiant.lastName?.[0] || ''}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {etudiant.firstName || 'Étudiant'} {etudiant.lastName || ''}
                        </h2>
                        <p className="text-slate-500">Étudiant</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Academic Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800 border-b pb-2">Informations académiques</h3>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#5B8DEF]/10 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-[#5B8DEF]" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500">Classe</div>
                                    <div className="font-medium text-slate-800">{etudiant.classe}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-[#10b981]" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500">Taux de présence</div>
                                    <div className="font-medium text-slate-800">{presenceStats ? `${Math.round(presenceStats.presenceRate)}%` : '—'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800 border-b pb-2">Informations personnelles</h3>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500">Email</div>
                                    <div className="font-medium text-slate-800">{etudiant.email || '—'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500">Téléphone</div>
                                    <div className="font-medium text-slate-800">{etudiant.phone || '—'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500">Adresse</div>
                                    <div className="font-medium text-slate-800">{etudiant.address || '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
