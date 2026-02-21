'use client';

import React, { useState } from 'react';
import { Eye, Plus, Pencil, Trash2, X } from 'lucide-react';
import SearchInput from '@/shared/components/SearchInput';
import FilterButton from '@/shared/components/FilterButton';
import Pagination from '@/shared/components/Pagination';
import { NiveauData } from '../types';
import { ApiError } from '@/shared/errors/ApiError';

interface NiveauxTableProps {
    data: NiveauData[];
    onCreate: (libelle: string) => Promise<void>;
    onUpdate: (id: string, libelle: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export default function NiveauxTable({ data, onCreate, onUpdate, onDelete }: NiveauxTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newNiveau, setNewNiveau] = useState({ libelle: '' });
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const itemsPerPage = 5;

    const filteredData = data.filter(item =>
        item.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
        if (!window.confirm(`Supprimer le niveau ${niveau.libelle} ?`)) return;
        try {
            await onDelete(niveau.id);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Suppression impossible';
            alert(message);
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
                        onClick={openCreate}
                        style={primaryButtonStyle}
                    >
                        <Plus size={18} />
                        Ajouter
                    </button>
                </div>
            </div>

            <div className="table-container" style={{ overflowX: 'auto', padding: '0 40px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                    <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 100%)' }}>
                            <th style={headerCellStyle}>N°</th>
                            <th style={headerCellStyle}>Libellé</th>
                            <th style={headerCellStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((niveau, index) => (
                            <tr key={niveau.id ?? niveau.libelle} style={{
                                background: index % 2 === 0 ? 'white' : '#fafbfc'
                            }}>
                                <td style={bodyCellStyle}>{startIndex + index + 1}</td>
                                <td style={bodyCellStyle}>{niveau.libelle}</td>
                                <td style={bodyCellStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <button style={iconButtonStyle}>
                                            <Eye size={18} color="#5B8DEF" strokeWidth={2.5} />
                                        </button>
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

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

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
