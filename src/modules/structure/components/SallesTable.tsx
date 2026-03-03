'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Plus, X, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import SearchInput from '@/shared/components/SearchInput';
import FilterButton from '@/shared/components/FilterButton';
import Pagination from '@/shared/components/Pagination';
import TableCard from '@/shared/components/TableCard';
import { SalleData } from '../types';
import { ApiError } from '@/shared/errors/ApiError';
import { SallePayload } from '../services/structureService';

interface SallesTableProps {
    data: SalleData[];
    currentPage: number;
    totalPages: number;
    searchTerm: string;
    onPageChange: (page: number) => void;
    onSearchChange: (value: string) => void;
    onCreate: (payload: SallePayload) => Promise<unknown>;
    onUpdate: (id: string, payload: SallePayload) => Promise<unknown>;
    onDelete: (id: string) => Promise<unknown>;
}

export default function SallesTable({
    data,
    currentPage,
    totalPages,
    searchTerm,
    onPageChange,
    onSearchChange,
    onCreate,
    onUpdate,
    onDelete
}: SallesTableProps) {
    const [showModal, setShowModal] = useState(false);
    const [newSalle, setNewSalle] = useState({ nom: '', capacite: 0 });
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    const startIndex = (currentPage - 1) * 10;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        try {
            setIsSubmitting(true);
            const payload: SallePayload = { libelle: newSalle.nom, capacity: newSalle.capacite };
            if (editingId) {
                await onUpdate(editingId, payload);
            } else {
                await onCreate(payload);
            }
            setShowModal(false);
            setEditingId(null);
            setNewSalle({ nom: '', capacite: 0 });
        } catch (err) {
            if (err instanceof ApiError) {
                setFormError(err.message);
            } else {
                setFormError('Impossible de sauvegarder la salle');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreate = () => {
        setEditingId(null);
        setFormError(null);
        setNewSalle({ nom: '', capacite: 0 });
        setShowModal(true);
    };

    const openEdit = (salle: SalleData) => {
        setEditingId(salle.id);
        setFormError(null);
        setNewSalle({ nom: salle.nom, capacite: salle.capacite });
        setShowModal(true);
    };

    const handleDelete = async (salle: SalleData) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: `Voulez-vous vraiment supprimer la salle "${salle.nom}" ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
        });

        if (!result.isConfirmed) return;
        try {
            await onDelete(salle.id);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Suppression impossible';
            Swal.fire({
                title: 'Erreur',
                text: message,
                icon: 'error'
            });
        }
    };

    return (
        <>
            <Styles />
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
                    onChange={onSearchChange}
                    placeholder="Rechercher une salle..."
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                    <FilterButton label="Filtrer" />
                    <button
                        onClick={openCreate}
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

            {/* Table - Desktop only */}
            {!isMobile && (
            <div className="table-container" style={{
                overflowX: 'auto',
                padding: '0 40px'
            }}>
                <table className="desktop-table" style={{
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
                            }}>Capacité</th>
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
                        {data.map((salle, index) => (
                            <tr key={salle.id} style={{
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
                                }}>{salle.nom}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: '#4a5568',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>{salle.capacite} places</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        {/* <button style={iconButtonStyle}>
                                        <Eye size={18} color="#5B8DEF" strokeWidth={2.5} />
                                    </button> */}
                                        <button style={iconButtonStyle} onClick={() => openEdit(salle)}>
                                            <Pencil size={18} color="#5B8DEF" strokeWidth={2.5} />
                                        </button>
                                        <button style={iconButtonStyle} onClick={() => handleDelete(salle)}>
                                            <Trash2 size={18} color="#5B8DEF" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}

            {/* Cards - Mobile only */}
            {isMobile && (
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
                {data.map((salle, index) => (
                    <div key={salle.id} style={{ width: '100%', maxWidth: '420px' }}>
                        <TableCard
                            index={index}
                            variant="classe"
                            fields={[
                                { label: 'Nom', value: salle.nom, highlight: true },
                                { label: 'Capacité', value: `${salle.capacite} places` }
                            ]}
                            onEdit={() => openEdit(salle)}
                            onDelete={() => handleDelete(salle)}
                        />
                    </div>
                ))}
                {data.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                        Aucune salle trouvée
                    </div>
                )}
            </div>
            )}
            <Pagination
                currentPage={currentPage}
                totalPages={Math.max(totalPages, 1)}
                onPageChange={onPageChange}
            />

            {/* Modal for adding new salle */}
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
                    onClick={() => {
                        setShowModal(false);
                        setEditingId(null);
                    }}
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
                            }}>{editingId ? 'Modifier une salle' : 'Ajouter une salle'}</h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingId(null);
                                }}
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
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Nom</label>
                                <input
                                    type="text"
                                    value={newSalle.nom}
                                    onChange={(e) => setNewSalle({ ...newSalle, nom: e.target.value })}
                                    placeholder="Ex: Salle A1"
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

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Capacité</label>
                                <input
                                    type="number"
                                    value={newSalle.capacite}
                                    onChange={(e) => setNewSalle({ ...newSalle, capacite: parseInt(e.target.value) || 0 })}
                                    placeholder="Ex: 30"
                                    min="0"
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

                            {formError && (
                                <div style={{ color: '#dc2626', marginBottom: '12px', fontSize: '13px' }}>
                                    {formError}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingId(null);
                                    }}
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
                                    disabled={isSubmitting}
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
                                        boxShadow: '0 4px 12px rgba(91,141,239,0.3)',
                                        opacity: isSubmitting ? 0.7 : 1
                                    }}
                                >
                                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

const iconButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    background: '#E3F2FD',
    cursor: 'pointer'
};

const Styles = () => (
    <style jsx>{`
        /* Desktop: hide mobile cards */
        @media (min-width: 769px) {
            div.mobile-cards {
                display: none !important;
            }
        }

        /* Mobile: hide table, show cards */
        @media (max-width: 768px) {
            div.search-filter-section {
                padding: 16px !important;
            }
            div.table-container {
                display: none !important;
            }
            table.desktop-table {
                display: none !important;
            }
            div.mobile-cards {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                padding: 16px !important;
                overflow-x: hidden !important;
                width: 100% !important;
                max-width: 100vw !important;
            }
        }
    `}</style>
);
