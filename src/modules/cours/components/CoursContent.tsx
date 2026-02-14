'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import Sidebar from '@/shared/components/Sidebar';
import Header from '@/shared/components/Header';
import CoursCard from './CoursCard';
import Pagination from '@/shared/components/Pagination';
import { coursData } from '../data/cours';
import { FiltreCours } from '../types';

export default function CoursContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtres, setFiltres] = useState<FiltreCours>({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Extraire les valeurs uniques pour les filtres
    const niveaux = useMemo(() => {
        const niveauxSet = new Set<string>();
        coursData.forEach(cours => {
            cours.niveau.split('/').forEach(n => niveauxSet.add(n.trim()));
        });
        return Array.from(niveauxSet).sort();
    }, []);

    const filières = useMemo(() => {
        const filieresSet = new Set<string>();
        coursData.forEach(cours => {
            // Extraire la filière du niveau (ex: CPD, GRLS de L1-CPD)
            const parts = cours.niveau.split('/');
            parts.forEach(p => {
                const match = p.match(/[A-Z]+$/);
                if (match) filieresSet.add(match[0]);
            });
        });
        return Array.from(filieresSet).sort();
    }, []);

    const classes = useMemo(() => {
        const classesSet = new Set<string>();
        coursData.forEach(cours => {
            cours.niveau.split('/').forEach(c => classesSet.add(c.trim()));
        });
        return Array.from(classesSet).sort();
    }, []);

    const professeurs = useMemo(() => {
        const profsSet = new Set(coursData.map(c => c.professeur));
        return Array.from(profsSet).sort();
    }, []);

    const coursFiltres = useMemo(() => {
        return coursData.filter(cours => {
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const matchSearch =
                    cours.titre.toLowerCase().includes(search) ||
                    cours.niveau.toLowerCase().includes(search) ||
                    cours.professeur.toLowerCase().includes(search);
                if (!matchSearch) return false;
            }

            if (filtres.niveau) {
                if (!cours.niveau.includes(filtres.niveau)) return false;
            }

            if (filtres.filiere) {
                if (!cours.niveau.includes(filtres.filiere)) return false;
            }

            if (filtres.professeur) {
                if (cours.professeur !== filtres.professeur) return false;
            }

            return true;
        });
    }, [searchTerm, filtres]);

    // Reset to page 1 when filters or search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filtres]);

    // Calculate pagination
    const totalPages = Math.ceil(coursFiltres.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const coursPagines = coursFiltres.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div style={{
            fontFamily: '"Outfit", "Poppins", -apple-system, sans-serif',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 50%, #3E6AB8 100%)',
            display: 'flex',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                pointerEvents: 'none'
            }} />

            <Sidebar activeItem="Cours" />

            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                marginLeft: '280px',
                paddingTop: '80px'
            }}>
                <Header userName="M. Diaby Kande" userRole="Attaché de classe" />

                <div style={{
                    flex: 1,
                    margin: '16px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a202c', margin: 0 }}>Gestion des cours</h1>
                    </div>

                    <div style={{
                        padding: '16px 24px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        background: '#fafbfc',
                        borderBottom: '1px solid #f1f5f9',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '250px' }}>
                            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                placeholder="Rechercher"
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

                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 18px',
                            background: 'white',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: '12px',
                            color: '#4a5568',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit'
                        }}>
                            <Filter size={16} strokeWidth={2.5} />
                        </button>

                        <button style={{
                            padding: '12px 24px',
                            background: '#5B8DEF',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit',
                            whiteSpace: 'nowrap'
                        }}>
                            Gerer les evaluations
                        </button>

                        <button style={{
                            padding: '12px 24px',
                            background: '#5B8DEF',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit',
                            whiteSpace: 'nowrap'
                        }}>
                            Gerer les salles
                        </button>
                    </div>

                    <div style={{
                        padding: '12px 24px',
                        background: '#f8fafc',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Filtrer par:</span>

                        <select
                            value={filtres.niveau || ''}
                            onChange={(e) => setFiltres({ ...filtres, niveau: e.target.value || undefined })}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1.5px solid #e5e7eb',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#475569',
                                background: 'white',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                minWidth: '120px'
                            }}
                        >
                            <option value="">Tous les niveaux</option>
                            {niveaux.map(niveau => (
                                <option key={niveau} value={niveau}>{niveau}</option>
                            ))}
                        </select>

                        <select
                            value={filtres.filiere || ''}
                            onChange={(e) => setFiltres({ ...filtres, filiere: e.target.value || undefined })}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1.5px solid #e5e7eb',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#475569',
                                background: 'white',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                minWidth: '120px'
                            }}
                        >
                            <option value="">Toutes les filières</option>
                            {filières.map(filiere => (
                                <option key={filiere} value={filiere}>{filiere}</option>
                            ))}
                        </select>

                        <select
                            value={filtres.professeur || ''}
                            onChange={(e) => setFiltres({ ...filtres, professeur: e.target.value || undefined })}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1.5px solid #e5e7eb',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#475569',
                                background: 'white',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                minWidth: '150px'
                            }}
                        >
                            <option value="">Tous les professeurs</option>
                            {professeurs.map(prof => (
                                <option key={prof} value={prof}>{prof}</option>
                            ))}
                        </select>

                        {(filtres.niveau || filtres.filiere || filtres.professeur) && (
                            <button
                                onClick={() => setFiltres({})}
                                style={{
                                    padding: '8px 16px',
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit'
                                }}
                            >
                                Réinitialiser
                            </button>
                        )}

                        <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                            {coursFiltres.length > 0
                                ? `${startIndex + 1}-${Math.min(endIndex, coursFiltres.length)} sur ${coursFiltres.length} cours`
                                : `0 cours`
                            }
                        </div>
                    </div>

                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                        {coursPagines.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                {coursPagines.map(cours => (
                                    <CoursCard key={cours.id} cours={cours} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#64748b' }}>Aucun cours trouvé</div>
                                <div style={{ fontSize: '14px', color: '#94a3b8' }}>Essayez de modifier vos filtres de recherche</div>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; }
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                input::placeholder { color: #000000; opacity: 0.6; }
            `}</style>
        </div>
    );
}

