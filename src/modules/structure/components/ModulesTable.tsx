'use client';

import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import SearchInput from '@/shared/components/SearchInput';
import FilterButton from '@/shared/components/FilterButton';
import Pagination from '@/shared/components/Pagination';
import { ModuleData } from '../data/modules';

interface ModulesTableProps {
    data: ModuleData[];
}

export default function ModulesTable({ data }: ModulesTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 3;

    // Filter data based on search term
    const filteredData = data.filter(item =>
        item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginate data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
            {/* Search and Filter Section */}
            <div style={{
                padding: '24px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafbfc'
            }}>
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Rechercher un module..."
                />
                <FilterButton label="Filtrer" />
            </div>

            {/* Table */}
            <div style={{
                overflow: 'auto',
                padding: '0 40px'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '600px'
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
                                width: '200px',
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
                            }}>Code</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '150px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Filière</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '120px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Crédits</th>
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
                        {paginatedData.map((module, index) => (
                            <tr key={module.id} style={{
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
                                    color: '#1a202c',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>{module.nom}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: '#5B8DEF',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>{module.code}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: '#5B8DEF',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>{module.filiereId}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: '#4a5568',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>{module.credits}</td>
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
        </>
    );
}

