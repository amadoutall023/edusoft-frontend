'use client';

import React, { useState, useMemo } from 'react';
import { Eye, X } from 'lucide-react';
import SearchInput from '@/shared/components/SearchInput';
import Pagination from '@/shared/components/Pagination';
import { Professeur } from '../types';

interface ProfesseursTableProps {
    data: Professeur[];
}

export default function ProfesseursTable({ data }: ProfesseursTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        grade: '',
        classe: '',
        specialite: ''
    });
    const itemsPerPage = 5;

    // Get unique values for filters
    const uniqueGrades = useMemo(() =>
        [...new Set(data.map(item => item.grade))].sort(),
        [data]
    );

    const uniqueClasses = useMemo(() =>
        [...new Set(data.map(item => item.classe))].sort(),
        [data]
    );

    const uniqueSpecialites = useMemo(() =>
        [...new Set(data.map(item => item.specialite))].sort(),
        [data]
    );

    // Filter data based on search term and filters
    const filteredData = data.filter(item => {
        const matchesSearch =
            item.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.classe.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.numero.includes(searchTerm);

        const matchesGrade = !filters.grade || item.grade === filters.grade;
        const matchesClasse = !filters.classe || item.classe === filters.classe;
        const matchesSpecialite = !filters.specialite || item.specialite === filters.specialite;

        return matchesSearch && matchesGrade && matchesClasse && matchesSpecialite;
    });

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    // Paginate data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ grade: '', classe: '', specialite: '' });
    };

    const hasActiveFilters = filters.grade || filters.classe || filters.specialite;

    return (
        <>
            {/* Search and Filter Section */}
            <div className="search-filter-section" style={{
                padding: '24px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafbfc',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Rechercher un professeur..."
                />
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 18px',
                        background: showFilters ? '#5B8DEF' : 'white',
                        border: `1.5px solid ${showFilters ? '#5B8DEF' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        color: showFilters ? 'white' : '#4a5568',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit'
                    }}
                >
                    <span>Filtrer</span>
                    {hasActiveFilters && (
                        <span style={{
                            background: 'white',
                            color: '#5B8DEF',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {[filters.grade, filters.classe, filters.specialite].filter(Boolean).length}
                        </span>
                    )}
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="filter-panel" style={{
                    padding: '20px 40px',
                    background: '#f0f7ff',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Grade</label>
                        <select
                            value={filters.grade}
                            onChange={(e) => handleFilterChange('grade', e.target.value)}
                            style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1.5px solid #e5e7eb',
                                background: 'white',
                                fontSize: '14px',
                                color: '#2d3748',
                                minWidth: '180px',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="">Tous les grades</option>
                            {uniqueGrades.map(grade => (
                                <option key={grade} value={grade}>{grade}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Classe</label>
                        <select
                            value={filters.classe}
                            onChange={(e) => handleFilterChange('classe', e.target.value)}
                            style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1.5px solid #e5e7eb',
                                background: 'white',
                                fontSize: '14px',
                                color: '#2d3748',
                                minWidth: '180px',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="">Toutes les classes</option>
                            {uniqueClasses.map(classe => (
                                <option key={classe} value={classe}>{classe}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Spécialité</label>
                        <select
                            value={filters.specialite}
                            onChange={(e) => handleFilterChange('specialite', e.target.value)}
                            style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1.5px solid #e5e7eb',
                                background: 'white',
                                fontSize: '14px',
                                color: '#2d3748',
                                minWidth: '180px',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="">Toutes les spécialités</option>
                            {uniqueSpecialites.map(specialite => (
                                <option key={specialite} value={specialite}>{specialite}</option>
                            ))}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 16px',
                                background: 'transparent',
                                border: '1.5px solid #e53e3e',
                                borderRadius: '8px',
                                color: '#e53e3e',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                marginTop: '18px',
                                fontFamily: 'inherit'
                            }}
                        >
                            <X size={16} />
                            <span>Effacer</span>
                        </button>
                    )}

                    <div className="results-count" style={{
                        marginLeft: 'auto',
                        fontSize: '14px',
                        color: '#4a5568',
                        fontWeight: '500'
                    }}>
                        {filteredData.length} résultat{filteredData.length !== 1 ? 's' : ''}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="table-container" style={{
                overflowX: 'auto',
                padding: '0 40px'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '1000px'
                }}>
                    <thead>
                        <tr style={{
                            background: 'linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 100%)',
                            borderRadius: '12px 12px 0 0'
                        }}>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '60px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>N°</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '130px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Prénom</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '130px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Nom</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '160px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Classe(s)</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '140px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Spécialité</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '150px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Grade</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '130px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Téléphone</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '100px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((prof, index) => (
                                <tr key={prof.id} style={{
                                    background: index % 2 === 0 ? 'white' : '#fafbfc',
                                    transition: 'all 0.2s ease'
                                }}
                                    onMouseEnter={(e: any) => {
                                        e.currentTarget.style.background = '#f0f7ff';
                                        e.currentTarget.style.transform = 'scale(1.002)';
                                    }}
                                    onMouseLeave={(e: any) => {
                                        e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafbfc';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: '#4a5568',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>{startIndex + index + 1}</td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: '#2d3748',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>{prof.prenom}</td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: '#2d3748',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        borderBottom: '1px solid #f1f5f9',
                                        textTransform: 'uppercase'
                                    }}>{prof.nom}</td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: '#5B8DEF',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>{prof.classe}</td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: '#4a5568',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>{prof.specialite}</td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: '#2d3748',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>{prof.grade}</td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: '#4a5568',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>{prof.numero}</td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        <button style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: '#E3F2FD',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                            onMouseEnter={(e: any) => {
                                                e.currentTarget.style.background = '#5B8DEF';
                                                e.currentTarget.querySelector('svg').style.color = 'white';
                                            }}
                                            onMouseLeave={(e: any) => {
                                                e.currentTarget.style.background = '#E3F2FD';
                                                e.currentTarget.querySelector('svg').style.color = '#5B8DEF';
                                            }}
                                        >
                                            <Eye size={18} color="#5B8DEF" strokeWidth={2.5} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: '#4a5568',
                                    fontSize: '16px'
                                }}>
                                    Aucun professeur ne correspond aux critères de recherche
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <style jsx>{`
                @media (max-width: 768px) {
                    .search-filter-section {
                        padding: 16px 20px !important;
                    }
                    .filter-panel {
                        padding: 16px 20px !important;
                    }
                    .table-container {
                        padding: 0 20px !important;
                    }
                    .results-count {
                        width: 100%;
                        margin-left: 0 !important;
                        margin-top: 12px;
                    }
                }
            `}</style>
        </>
    );
}

