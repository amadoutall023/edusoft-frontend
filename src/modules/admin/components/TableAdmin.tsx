'use client';

import React, { useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import SearchInput from '@/shared/components/SearchInput';
import FilterButton from '@/shared/components/FilterButton';
import Pagination from '@/shared/components/Pagination';
import TableCard from '@/shared/components/TableCard';
import { MembreAdministration } from '../types';
import MemberDetailModal from './MemberDetailModal';

interface TableAdminProps {
    data: MembreAdministration[];
}

export default function TableAdmin({ data }: TableAdminProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState<MembreAdministration | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const itemsPerPage = 3;

    // Filter data based on search term
    const filteredData = data.filter(item => {
        const search = searchTerm.toLowerCase();
        return (
            item.prenom.toLowerCase().includes(search) ||
            item.nom.toLowerCase().includes(search) ||
            item.role.toLowerCase().includes(search) ||
            (item.telephone ?? '').includes(search) ||
            item.email.toLowerCase().includes(search)
        );
    }
    );

    // Paginate data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Handle view action - show member details
    const handleView = (membre: MembreAdministration) => {
        setSelectedMember(membre);
        setIsDetailModalOpen(true);
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
                    placeholder="Rechercher un membre..."
                />
                <FilterButton label="Filtrer" />
            </div>

            {/* Table */}
            <div className="table-container" style={{
                overflowX: 'auto',
                padding: '0 40px'
            }}>
                <table className="desktop-table" style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '800px'
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
                                width: '80px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>N°</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '150px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Prénom</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '150px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Nom</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '180px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Téléphone</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '130px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Rôle</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '150px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Login</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '120px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((membre, index) => (
                            <tr key={membre.id} style={{
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
                                }}>{membre.prenom}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: '#2d3748',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    borderBottom: '1px solid #f1f5f9',
                                    textTransform: 'uppercase'
                                }}>{membre.nom}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: '#4a5568',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>{membre.telephone ?? '—'}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: '#5B8DEF',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>{membre.role}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: '#4a5568',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>{membre.login}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>
                                    <button
                                        onClick={() => handleView(membre)}
                                        style={{
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

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
                {paginatedData.map((membre, index) => (
                    <div key={membre.id} style={{ width: '100%', maxWidth: '420px' }}>
                        <TableCard
                            index={startIndex + index}
                            variant="classe"
                            fields={[
                                { label: 'Nom', value: `${membre.prenom} ${membre.nom}`, highlight: true },
                                { label: 'Rôle', value: membre.role },
                                { label: 'Téléphone', value: membre.telephone ?? '—' },
                                { label: 'Email', value: membre.email }
                            ]}
                            onView={() => handleView(membre)}
                            onEdit={() => handleView(membre)}
                            onDelete={() => handleView(membre)}
                        />
                    </div>
                ))}
                {paginatedData.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                        Aucun membre trouvé
                    </div>
                )}
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .search-filter-section {
                        padding: 16px 20px !important;
                    }
                    .table-container {
                        padding: 0 20px !important;
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

            {/* Member Detail Modal */}
            <MemberDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                member={selectedMember}
            />
        </>
    );
}
