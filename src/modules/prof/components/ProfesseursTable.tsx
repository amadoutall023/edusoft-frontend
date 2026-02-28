'use client';

import React, { useState, useMemo } from 'react';
import { Eye, X, Trash2 } from 'lucide-react';
import SearchInput from '@/shared/components/SearchInput';
import Pagination from '@/shared/components/Pagination';
import TableCard from '@/shared/components/TableCard';
import { ProfessorData } from '../types';

interface ProfesseursTableProps {
    data: ProfessorData[];
    onDelete?: (professor: ProfessorData) => Promise<void>;
    onViewDetails?: (professor: ProfessorData) => void;
}

export default function ProfesseursTable({ data, onDelete, onViewDetails }: ProfesseursTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        grade: '',
        specialite: ''
    });
    const itemsPerPage = 10;

    // Get unique values for filters
    const uniqueGrades = useMemo(() =>
        [...new Set(data.map(item => item.grade).filter(Boolean))].sort() as string[],
        [data]
    );

    const uniqueSpecialites = useMemo(() =>
        [...new Set(data.map(item => item.specialite).filter(Boolean))].sort() as string[],
        [data]
    );

    // Filter data based on search term and filters
    const filteredData = data.filter(item => {
        const matchesSearch =
            item.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.specialite && item.specialite.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.grade && item.grade.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.telephone && item.telephone.includes(searchTerm));

        const matchesGrade = !filters.grade || item.grade === filters.grade;
        const matchesSpecialite = !filters.specialite || item.specialite === filters.specialite;

        return matchesSearch && matchesGrade && matchesSpecialite;
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
        setFilters({ grade: '', specialite: '' });
    };

    const hasActiveFilters = filters.grade || filters.specialite;

    // Handle actions for mobile cards
    const handleViewDetails = (professor: ProfessorData) => {
        if (onViewDetails) {
            onViewDetails(professor);
        }
    };

    const handleDeleteClick = (professor: ProfessorData) => {
        if (onDelete) {
            onDelete(professor);
        }
    };

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
                            {[filters.grade, filters.specialite].filter(Boolean).length}
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
                <table className="desktop-table" style={{
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
                                width: '50px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>N°</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '120px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Prénom</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '120px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Nom</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '150px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Email</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '120px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Téléphone</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '140px',
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
                            }}>Spécialité</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '120px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: '#64748b',
                                    fontSize: '14px'
                                }}>
                                    Aucun professeur trouvé
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((professor, index) => (
                                <tr
                                    key={professor.id}
                                    style={{
                                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                        borderBottom: '1px solid #e2e8f0',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseEnter={(e: any) => { e.currentTarget.style.background = '#f1f5f9'; }}
                                    onMouseLeave={(e: any) => { e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc'; }}
                                >
                                    <td style={{
                                        padding: '14px 16px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        color: '#64748b'
                                    }}>
                                        {startIndex + index + 1}
                                    </td>
                                    <td style={{
                                        padding: '14px 16px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#1e293b'
                                    }}>
                                        {professor.prenom}
                                    </td>
                                    <td style={{
                                        padding: '14px 16px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#1e293b'
                                    }}>
                                        {professor.nom}
                                    </td>
                                    <td style={{
                                        padding: '14px 16px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        color: '#475569'
                                    }}>
                                        {professor.email}
                                    </td>
                                    <td style={{
                                        padding: '14px 16px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        color: '#475569'
                                    }}>
                                        {professor.telephone || '-'}
                                    </td>
                                    <td style={{
                                        padding: '14px 16px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        color: '#475569'
                                    }}>
                                        {professor.grade || '-'}
                                    </td>
                                    <td style={{
                                        padding: '14px 16px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        color: '#475569'
                                    }}>
                                        {professor.specialite || '-'}
                                    </td>
                                    <td style={{
                                        padding: '14px 16px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}>
                                            {onViewDetails && (
                                                <button
                                                    onClick={() => onViewDetails(professor)}
                                                    title="Voir les détails"
                                                    style={{
                                                        padding: '8px',
                                                        background: '#5B8DEF',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Eye size={16} color="white" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(professor)}
                                                    title="Supprimer"
                                                    style={{
                                                        padding: '8px',
                                                        background: '#ef4444',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Trash2 size={16} color="white" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ padding: '24px 40px' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Cards - Mobile */}
            <div
                className="mobile-cards"
                style={{
                    padding: '16px',
                    overflowX: 'hidden',
                    maxWidth: '100vw',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                {paginatedData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                        Aucun professeur trouvé
                    </div>
                ) : (
                    paginatedData.map((professor, index) => (
                        <div key={professor.id} style={{ width: '100%', maxWidth: '420px' }}>
                            <TableCard
                                index={startIndex + index}
                                variant="classe"
                                fields={[
                                    { label: 'Nom', value: `${professor.prenom} ${professor.nom}`, highlight: true },
                                    { label: 'Grade', value: professor.grade ?? '—' },
                                    { label: 'Spécialité', value: professor.specialite ?? '—' },
                                    { label: 'Téléphone', value: professor.telephone ?? '—' },
                                    { label: 'Email', value: professor.email }
                                ]}
                                onEdit={() => handleViewDetails(professor)}
                                onDelete={() => handleDeleteClick(professor)}
                            />
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .search-filter-section, .filter-panel, .table-container {
                        padding-left: 20px !important;
                        padding-right: 20px !important;
                    }
                    /* Hide table on mobile */
                    .table-container {
                        display: none !important;
                    }
                    table.desktop-table {
                        display: none !important;
                    }
                    /* Show mobile cards on mobile */
                    .mobile-cards {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        padding: 16px !important;
                        overflow-x: hidden !important;
                        width: 100% !important;
                        max-width: 100vw !important;
                    }
                }

                /* Desktop: hide mobile cards */
                @media (min-width: 769px) {
                    .mobile-cards {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}
