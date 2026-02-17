'use client';

import React, { useState } from 'react';
import { Eye, Plus, Pencil, Trash2, X } from 'lucide-react';
import SearchInput from '@/shared/components/SearchInput';
import FilterButton from '@/shared/components/FilterButton';
import Pagination from '@/shared/components/Pagination';
import { NiveauData } from '../types';

interface NiveauxTableProps {
    data: NiveauData[];
}

export default function NiveauxTable({ data }: NiveauxTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newNiveau, setNewNiveau] = useState({ libelle: '' });
    const itemsPerPage = 5;

    // Filter data based on search term
    const filteredData = data.filter(item =>
        item.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginate data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Nouveau niveau:', newNiveau);
        setShowModal(false);
        setNewNiveau({ libelle: '' });
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
                <div className="search-wrapper" style={{ flex: '1', minWidth: '200px', maxWidth: '400px' }}>
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Rechercher un niveau..."
                    />
                </div>
                <div className="actions-wrapper" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <FilterButton label="Filtrer" />
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 12px rgba(91,141,239,0.3)',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e: any) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(91,141,239,0.4)';
                        }}
                        onMouseLeave={(e: any) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(91,141,239,0.3)';
                        }}
                    >
                        <Plus size={18} />
                        Ajouter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-container" style={{
                overflowX: 'auto',
                padding: '0 40px'
            }}>
                <table className="niveaux-table" style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '500px'
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
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Libellé</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '180px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((niveau, index) => (
                            <tr key={index} style={{
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
                                }}>{niveau.libelle}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
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
                                            <Pencil size={18} color="#5B8DEF" strokeWidth={2.5} />
                                        </button>
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
                                            <Trash2 size={18} color="#5B8DEF" strokeWidth={2.5} />
                                        </button>
                                    </div>
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

            {/* Modal for adding new niveau */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}
                    onClick={() => setShowModal(false)}
                >
                    <div className="modal-content" style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '32px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        animation: 'slideIn 0.3s ease'
                    }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: '700',
                                color: '#1a202c',
                                margin: 0
                            }}>Ajouter un niveau</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: '#f1f5f9',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Libellé</label>
                                <input
                                    type="text"
                                    value={newNiveau.libelle}
                                    onChange={(e) => setNewNiveau({ ...newNiveau, libelle: e.target.value })}
                                    placeholder="Ex: Première année"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                                    onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        background: 'white',
                                        color: '#64748b',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 12px rgba(91,141,239,0.3)'
                                    }}
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    .search-filter-section {
                        padding: 16px 20px !important;
                    }
                    .search-wrapper {
                        max-width: 100% !important;
                    }
                    .actions-wrapper {
                        width: 100%;
                        justify-content: flex-start;
                    }
                    .table-container {
                        padding: 0 20px !important;
                    }
                }
                @media (max-width: 480px) {
                    .search-filter-section {
                        padding: 12px 16px !important;
                        gap: 12px !important;
                    }
                    .actions-wrapper button {
                        padding: 8px 12px !important;
                        font-size: 13px !important;
                    }
                }
            `}</style>
        </>
    );
}

