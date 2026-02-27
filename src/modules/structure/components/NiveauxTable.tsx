'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Plus, Pencil, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import SearchInput from '@/shared/components/SearchInput';
import FilterButton from '@/shared/components/FilterButton';
import Pagination from '@/shared/components/Pagination';
import TableCard from '@/shared/components/TableCard';
import { NiveauData } from '../types';
import { ApiError } from '@/shared/errors/ApiError';

interface NiveauxTableProps {
    data: NiveauData[];
    currentPage: number;
    totalPages: number;
    searchTerm: string;
    onPageChange: (page: number) => void;
    onSearchChange: (value: string) => void;
    onCreate: (libelle: string) => Promise<unknown>;
    onUpdate: (id: string, libelle: string) => Promise<unknown>;
    onDelete: (id: string) => Promise<unknown>;
}

export default function NiveauxTable({
    data,
    currentPage,
    totalPages,
    searchTerm,
    onPageChange,
    onSearchChange,
    onCreate,
    onUpdate,
    onDelete
}: NiveauxTableProps) {
    const [showModal, setShowModal] = useState(false);
    const [newNiveau, setNewNiveau] = useState({ libelle: '' });
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const startIndex = (currentPage - 1) * 10;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setFormError(null);
        setNewNiveau({ libelle: '' });
        setShowModal(true);
    };

    const openEdit = (niveau: NiveauData) => {
        if (!niveau.id) return;
        setEditingId(niveau.id);
        setFormError(null);
        setNewNiveau({ libelle: niveau.libelle });
        setShowModal(true);
    };

    const handleDelete = async (niveau: NiveauData) => {
        if (!niveau.id) return;

        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: `Voulez-vous vraiment supprimer le niveau "${niveau.libelle}" ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            await onDelete(niveau.id);
            Swal.fire({
                title: 'Supprimé !',
                text: 'Le niveau a été supprimé avec succès.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Suppression impossible';
            Swal.fire({
                title: 'Erreur',
                text: message,
                icon: 'error'
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        try {
            setIsSubmitting(true);
            if (editingId) {
                await onUpdate(editingId, newNiveau.libelle);
            } else {
                await onCreate(newNiveau.libelle);
            }
            setShowModal(false);
            setEditingId(null);
            setNewNiveau({ libelle: '' });
        } catch (err) {
            if (err instanceof ApiError) {
                setFormError(err.message);
            } else {
                setFormError('Impossible de sauvegarder le niveau');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Styles />
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
                        onChange={onSearchChange}
                        placeholder="Rechercher un niveau..."
                    />
                </div>
                <div className="actions-wrapper" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <FilterButton label="Filtrer" />
                    <button
                        onClick={openCreate}
                        style={primaryButtonStyle}
                    >
                        <Plus size={18} />
                        Ajouter
                    </button>
                </div>
            </div>

            {/* Table - Desktop only */}
            {!isMobile && (
                <div className="table-container" style={{ overflowX: 'auto', padding: '0 40px' }}>
                    <table className="desktop-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 100%)' }}>
                                <th style={headerCellStyle}>N°</th>
                                <th style={headerCellStyle}>Libellé</th>
                                <th style={headerCellStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((niveau, index) => (
                                <tr key={niveau.id ?? niveau.libelle} style={{
                                    background: index % 2 === 0 ? 'white' : '#fafbfc'
                                }}>
                                    <td style={bodyCellStyle}>{startIndex + index + 1}</td>
                                    <td style={bodyCellStyle}>{niveau.libelle}</td>
                                    <td style={bodyCellStyle}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button style={iconButtonStyle} onClick={() => openEdit(niveau)}>
                                                <Pencil size={18} color="#5B8DEF" strokeWidth={2.5} />
                                            </button>
                                            <button style={iconButtonStyle} onClick={() => handleDelete(niveau)}>
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
                {data.map((niveau, index) => (
                    <div key={niveau.id ?? niveau.libelle} style={{ width: '100%', maxWidth: '420px' }}>
                        <TableCard
                            index={index}
                            variant="classe"
                            fields={[
                                { label: 'Libellé', value: niveau.libelle, highlight: true }
                            ]}
                            onEdit={() => openEdit(niveau)}
                            onDelete={() => handleDelete(niveau)}
                        />
                    </div>
                ))}
                {data.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                        Aucun niveau trouvé
                    </div>
                )}
            </div>
            )}

            <Pagination currentPage={currentPage} totalPages={Math.max(totalPages, 1)} onPageChange={onPageChange} />

            {showModal && (
                <div className="modal-overlay" style={modalOverlayStyle} onClick={() => { setShowModal(false); setEditingId(null); }}>
                    <div className="modal-content" style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={modalHeaderStyle}>
                            <h2 style={modalTitleStyle}>{editingId ? 'Modifier un niveau' : 'Ajouter un niveau'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingId(null); }} style={closeButtonStyle}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Libellé</label>
                                <input
                                    type="text"
                                    value={newNiveau.libelle}
                                    onChange={(e) => setNewNiveau({ libelle: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            {formError && (
                                <div style={{ color: '#dc2626', marginBottom: '12px', fontSize: '13px' }}>{formError}</div>
                            )}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} style={cancelButtonStyle}>
                                    Annuler
                                </button>
                                <button type="submit" disabled={isSubmitting} style={submitButtonStyle(isSubmitting)}>
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

const headerCellStyle: React.CSSProperties = {
    padding: '16px',
    textAlign: 'center',
    color: 'white',
    fontWeight: 600,
    fontSize: '14px'
};

const bodyCellStyle: React.CSSProperties = {
    padding: '16px',
    textAlign: 'center',
    color: '#1a202c',
    fontSize: '14px',
    fontWeight: 500,
    borderBottom: '1px solid #f1f5f9'
};

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

const primaryButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(91,141,239,0.3)'
};

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    width: '90%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
};

const modalHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px'
};

const modalTitleStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1a202c',
    margin: 0
};

const closeButtonStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: 'none',
    background: '#f1f5f9',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#4a5568',
    marginBottom: '8px'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'inherit'
};

const cancelButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    background: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
};

const submitButtonStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    boxShadow: '0 4px 12px rgba(91,141,239,0.3)'
});

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
            div.search-wrapper {
                max-width: 100% !important;
            }
            div.actions-wrapper {
                width: 100%;
                justify-content: flex-start;
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
