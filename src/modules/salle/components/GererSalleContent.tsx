'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Clock, Users, ArrowLeft, MapPinned, Check, X, Building, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SalleCard from './SalleCard';
import StatCard from './StatCard';
import { Salle, StatistiqueSalle, FiltreSalle } from './types';
import { fetchSalles } from '@/modules/structure/services/structureService';
import { SalleResponseDto } from '@/shared/api/types';

// Convertir les données du backend au format frontend
const mapBackendSalleToSalle = (salle: SalleResponseDto): Salle => ({
    id: parseInt(salle.id.replace(/-/g, '').substring(0, 8), 16),
    numero: salle.libelle,
    etage: '1er étage', // Par défaut, à ajuster si le backend fournit l'étage
    capacite: salle.capacity ?? 0,
    statut: 'Libre', // Par défaut, à ajuster selon la logique métier
    ocupationActuelle: undefined,
    prochaineCourse: undefined
});

export default function GererSalleContent() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [filtres, setFiltres] = useState<FiltreSalle>({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // États pour les données du backend
    const [salles, setSalles] = useState<Salle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les données depuis le backend
    useEffect(() => {
        const loadSalles = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetchSalles(100);
                const mappedSalles = response.map(mapBackendSalleToSalle);
                setSalles(mappedSalles);
            } catch (err) {
                console.error('Erreur lors du chargement des salles:', err);
                setError('Impossible de charger les salles. Veuillez réessayer plus tard.');
            } finally {
                setLoading(false);
            }
        };

        loadSalles();
    }, []);

    // Extraire les valeurs uniques pour les filtres
    const etages = useMemo(() => {
        const etagesSet = new Set(salles.map(s => s.etage));
        return Array.from(etagesSet).sort();
    }, [salles]);

    const statuts = useMemo(() => {
        const statutsSet = new Set(salles.map(s => s.statut));
        return Array.from(statutsSet).sort();
    }, [salles]);

    const sallesFiltrees = useMemo(() => {
        return salles.filter(salle => {
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const matchSearch =
                    salle.numero.toLowerCase().includes(search) ||
                    salle.etage.toLowerCase().includes(search);
                if (!matchSearch) return false;
            }

            if (filtres.etage) {
                if (salle.etage !== filtres.etage) return false;
            }

            if (filtres.statut) {
                if (salle.statut !== filtres.statut) return false;
            }

            return true;
        });
    }, [searchTerm, filtres, salles]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filtres]);

    const totalPages = Math.ceil(sallesFiltrees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const sallesPaginees = sallesFiltrees.slice(startIndex, endIndex);

    // Statistiques calculées dynamiquement
    const statistiques: StatistiqueSalle[] = useMemo(() => {
        const total = salles.length;
        const libres = salles.filter(s => s.statut === 'Libre').length;
        const occupees = total - libres;

        return [
            {
                label: 'Total salles',
                nombre: total,
                couleur: 'blue',
                icon: 'map'
            },
            {
                label: 'Salles libres',
                nombre: libres,
                couleur: 'green',
                icon: 'check'
            },
            {
                label: 'Salles occupées',
                nombre: occupees,
                couleur: 'red',
                icon: 'x'
            }
        ];
    }, [salles]);

    return (
        <>
            {/* Page Title */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '32px 40px 24px',
                borderBottom: '1px solid #e2e8f0',
                gap: '16px'
            }}>
                <button
                    onClick={() => router.push('/dashboard/cours-attache')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        border: '1.5px solid #e5e7eb',
                        background: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ArrowLeft size={20} color="#64748b" />
                </button>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a202c',
                    margin: 0,
                    letterSpacing: '-0.5px'
                }}>
                    Gestion des salles
                </h1>
            </div>

            {/* Statistics Section */}
            <div className="stats-grid" style={{
                padding: '24px 40px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                background: '#fafbfc',
                borderBottom: '1px solid #f1f5f9'
            }}>
                {statistiques.map((stat, index) => (
                    <StatCard key={index} stat={stat} />
                ))}
            </div>

            {/* Search and Filter Section */}
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
                        placeholder="Rechercher une salle..."
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

                <div className="results-count" style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    {loading ? 'Chargement...' : sallesFiltrees.length > 0
                        ? `${startIndex + 1}-${Math.min(endIndex, sallesFiltrees.length)} sur ${sallesFiltrees.length} salles`
                        : `0 salles`
                    }
                </div>
            </div>

            {/* Filters Section */}
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
                    value={filtres.etage || ''}
                    onChange={(e) => setFiltres({ ...filtres, etage: e.target.value || undefined })}
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
                        minWidth: '140px'
                    }}
                >
                    <option value="">Tous les étages</option>
                    {etages.map(etage => (
                        <option key={etage} value={etage}>{etage}</option>
                    ))}
                </select>

                <select
                    value={filtres.statut || ''}
                    onChange={(e) => setFiltres({ ...filtres, statut: e.target.value || undefined })}
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
                        minWidth: '140px'
                    }}
                >
                    <option value="">Tous les statuts</option>
                    {statuts.map(statut => (
                        <option key={statut} value={statut}>{statut}</option>
                    ))}
                </select>

                {(filtres.etage || filtres.statut) && (
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
            </div>

            {/* Cards Container */}
            <div className="cards-container" style={{ padding: '24px' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <Loader2 size={48} style={{ marginBottom: '16px', color: '#94a3b8', animation: 'spin 1s linear infinite' }} className="animate-spin" />
                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#64748b' }}>
                            Chargement des salles...
                        </div>
                    </div>
                ) : error ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>
                            {error}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '12px 24px',
                                background: '#5B8DEF',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginTop: '16px'
                            }}
                        >
                            Réessayer
                        </button>
                    </div>
                ) : sallesPaginees.length > 0 ? (
                    <div className="cards-grid">
                        {sallesPaginees.map(salle => (
                            <SalleCard key={salle.id} salle={salle} />
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <Building size={48} style={{ marginBottom: '16px', color: '#94a3b8' }} />
                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#64748b' }}>
                            Aucune salle trouvée
                        </div>
                        <div style={{ fontSize: '14px', color: '#94a3b8' }}>Essayez de modifier vos filtres de recherche</div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: currentPage === page ? '#5B8DEF' : '#f1f5f9',
                                    color: currentPage === page ? 'white' : '#64748b',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                .stats-grid {
                    padding: 24px 40px;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    background: #fafbfc;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                }
                
                .cards-container {
                    padding: 24px;
                }
                
                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr !important;
                        padding: 16px !important;
                    }
                    .cards-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .cards-container {
                        padding: 16px !important;
                    }
                }
            `}</style>
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </>
    );
}
