'use client';

import React, { useState, useEffect } from 'react';
import MenuActionCard from './MenuActionCard';
import { etudiantActuel, menuActions, mapStudentToEtudiant } from '../data/etudiants';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { BookOpen, UserCheck, Loader2, Users } from 'lucide-react';
import { Etudiant, MenuAction } from '../types';
import { fetchMyPresenceStats, fetchCurrentStudent, StudentPresenceStats } from '../services/dashboardService';

export default function EtudiantDashboard() {
    const { user, roles } = useAuth();
    const isResponsable = roles.includes('ROLE_RESPONSABLE');
    const [etudiant, setEtudiant] = useState<Etudiant>({
        ...etudiantActuel,
        firstName: user?.firstName || '',
        lastName: user?.lastName || ''
    });
    const [presence, setPresence] = useState<number>(0);
    const [presenceStats, setPresenceStats] = useState<StudentPresenceStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStudentData();
    }, []);

    const loadStudentData = async () => {
        try {
            setIsLoading(true);

            // Recuperer les infos de l'etudiant connecte via le service
            const studentData = await fetchCurrentStudent();

            if (studentData) {
                const mappedEtudiant = mapStudentToEtudiant(studentData);
                setEtudiant({
                    ...mappedEtudiant,
                    firstName: user?.firstName || mappedEtudiant.firstName,
                    lastName: user?.lastName || mappedEtudiant.lastName
                });

                // Recuperer les statistiques de presence depuis l'API
                const stats = await fetchMyPresenceStats();
                setPresenceStats(stats);
                setPresence(stats.presenceRate);
            } else {
                // Si l'API retourne null (utilisateur pas un etudiant), utiliser les donnees auth
                setEtudiant({
                    ...etudiantActuel,
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || ''
                });
                setPresence(0);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des donnees de l\'etudiant:', error);
            // En cas d'erreur, utiliser les donnees de l'auth
            setEtudiant({
                ...etudiantActuel,
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || ''
            });
            setPresence(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Utiliser les donnees auth si disponibles
    const nom = etudiant.lastName || user?.lastName || '';
    const prenom = etudiant.firstName || user?.firstName || '';

    // Menu des actions - ajouter Pointer pour les responsables
    const menuItems: MenuAction[] = [...menuActions];
    if (isResponsable) {
        menuItems.unshift({
            id: 'pointer',
            titre: 'Pointer les Étudiants',
            sousTitre: 'Enregistrer présence',
            icon: Users,
            couleur: 'green',
            route: '/dashboard/etudiant/pointer'
        });
    }

    // Stats pour l'etudiant
    const stats = [
        {
            titre: 'Classe',
            valeur: etudiant.classe || 'Non assigne',
            icon: BookOpen,
            couleur: '#5B8DEF'
        },
        {
            titre: 'Presence',
            valeur: presence > 0 ? `${presence.toFixed(1)}%` : '—',
            icon: UserCheck,
            couleur: presenceStats && presenceStats.absentCount > 0 ? '#ef4444' : '#10b981'
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#5B8DEF]" />
                    <p className="text-slate-500">Chargement des donnees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header avec clip-path et photo */}
            <div className="bg-gradient-to-r from-[#5B8DEF] to-[#4169B8] rounded-xl md:rounded-[20px] p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                {/* Clip-path decorative */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex items-center gap-4">
                    {/* Photo de profil ronde */}
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 flex items-center justify-center shrink-0">
                        <span className="text-3xl md:text-4xl font-bold">
                            {prenom ? prenom[0].toUpperCase() : '?'}
                            {nom ? nom[0].toUpperCase() : ''}
                        </span>
                    </div>

                    {/* Bonjour + Nom */}
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Bonjour {prenom || 'Etudiant'} {nom} 👋
                    </h1>
                </div>
            </div>

            {/* Stats Grid - Classe et Presence sur une ligne */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
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
                                    className="text-xl md:text-2xl font-extrabold leading-none truncate"
                                    style={{ color: stat.couleur, letterSpacing: '-1px' }}
                                >
                                    {stat.valeur}
                                </div>
                            </div>
                            <div
                                className="w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${stat.couleur}15` }}
                            >
                                <stat.icon className="w-5 h-5 md:w-7 md:h-7" color={stat.couleur} strokeWidth={2} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Menu des actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(action => (
                    <MenuActionCard key={action.id} action={action} />
                ))}
            </div>
        </div>
    );
}
