'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Pagination from '@/shared/components/Pagination';
import { Cours } from '../types';
import { fetchCourses } from '../services/coursService';
import { CoursResponseDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';
import CoursCard from './CoursCard';
import { useAuth } from '@/modules/auth/context/AuthContext';

const mapCoursDto = (cours: CoursResponseDto): Cours => {
    const total = cours.totalHour ?? 0;
    const completed = cours.completedHour ?? 0;
    const progression = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

    return {
        id: cours.id,
        titre: cours.libelle,
        niveau: cours.classes?.map(classe => classe.libelle).join(' / ') ?? '—',
        filiere: cours.module?.libelle ?? undefined,
        professeur: cours.professor
            ? `${cours.professor.firstName ?? ''} ${cours.professor.lastName ?? ''}`.trim() || 'Non assigné'
            : 'Non assigné',
        volumeHoraire: total,
        heuresPlanifie: cours.plannedHour ?? 0,
        heuresFaites: completed,
        heuresRestantes: Math.max(0, total - completed),
        progression,
        classes: cours.classes?.map(classe => classe.libelle) ?? [],
        module: cours.module?.libelle ?? null,
        summary: cours.summary ?? null,
        professorId: cours.professor?.id ?? null,
        moduleId: cours.module?.id ?? null
    };
};

export default function CoursAttacheContent() {
    const router = useRouter();
    const { roles } = useAuth();
    const isProfesseur = roles.includes('ROLE_PROFESSEUR');
    const isAttache = roles.includes('ROLE_ATTACHE_CLASSE');
    const [courses, setCourses] = useState<Cours[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    useEffect(() => {
        let isMounted = true;

        const loadCourses = async () => {
            try {
                setIsLoading(true);
                const apiCourses = await fetchCourses();
                if (!isMounted) return;
                setCourses(apiCourses.map(mapCoursDto));
                setError(null);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof ApiError ? err.message : 'Impossible de charger les cours.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadCourses();

        return () => {
            isMounted = false;
        };
    }, []);

    const coursFiltres = useMemo(() => {
        return courses.filter(cours => {
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const matchSearch =
                    cours.titre.toLowerCase().includes(search) ||
                    cours.niveau.toLowerCase().includes(search) ||
                    cours.professeur.toLowerCase().includes(search);
                if (!matchSearch) return false;
            }
            return true;
        });
    }, [searchTerm, courses]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(coursFiltres.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const coursPagines = coursFiltres.slice(startIndex, endIndex);

    const handleGererEvaluation = () => {
        router.push(isProfesseur ? '/dashboard/prof/evaluations' : '/dashboard/evaluation');
    };

    return (
        <>
            {/* Page Title */}
            <div style={{
                padding: '32px 40px 24px',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a202c',
                    margin: 0,
                    letterSpacing: '-0.5px'
                }}>
                    Mes Cours
                </h1>
            </div>

            {/* Action Buttons */}
            <div style={{
                padding: '16px 24px',
                display: 'flex',
                gap: '12px',
                background: '#fafbfc',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <button
                    onClick={handleGererEvaluation}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px', 
                        fontWeight: '600',
                        cursor: 'pointer', 
                        transition: 'all 0.2s ease', 
                        boxShadow: '0 4px 12px rgba(91,141,239,0.3)' 
                    }}
                >
                    <FileText size={18} />
                    Gérer évaluation
                </button>
                {/* <button
                    onClick={handleGererSalle}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'white',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '12px',
                        color: '#4a5568',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <MapPin size={18} />
                    Gérer salle
                </button> */}
            </div>

            {/* Search Section */}
            <div style={{
                padding: '16px 24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                background: '#fafbfc',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '250px' }}>
                    <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Rechercher un cours..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 42px',
                            borderRadius: '12px',
                            border: '1.5px solid #e5e7eb',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit',
                            background: 'white',
                            color: '#000000'
                        }}
                    />
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    {coursFiltres.length > 0
                        ? `${startIndex + 1}-${Math.min(endIndex, coursFiltres.length)} sur ${coursFiltres.length} cours`
                        : `0 cours`
                    }
                </div>
            </div>

            {error && (
                <div style={{ padding: '16px 40px', color: '#dc2626' }}>
                    {error}
                </div>
            )}

            {isLoading && (
                <div style={{ padding: '16px 40px', color: '#64748b' }}>
                    Chargement des cours...
                </div>
            )}

            {/* Cards Container */}
            <div style={{ padding: '16px' }}>
                {!isLoading && coursPagines.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        {coursPagines.map(cours => (
                            <CoursCard
                                key={cours.id}
                                cours={cours}
                                showActions={false}
                                showCreateSession={!isProfesseur}
                                readOnly={isProfesseur}
                                showSupportAccess={isProfesseur || isAttache}
                                canManageSupports={isProfesseur}
                            />
                        ))}
                    </div>
                ) : !isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#64748b' }}>
                            Aucun cours trouvé
                        </div>
                    </div>
                ) : null}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </>
    );
}
