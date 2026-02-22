'use client';

import React, { useState } from 'react';
import { Eye, Plus, X, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import SearchInput from '@/shared/components/SearchInput';
import Pagination from '@/shared/components/Pagination';
import { FiliereData } from '../types';
import { ApiError } from '@/shared/errors/ApiError';

interface FilieresTableProps {
    data: FiliereData[];
    currentPage: number;
    totalPages: number;
    searchTerm: string;
    onPageChange: (page: number) => void;
    onSearchChange: (value: string) => void;
    onCreate: (libelle: string) => Promise<unknown>;
    onUpdate: (id: string, libelle: string) => Promise<unknown>;
    onDelete: (id: string) => Promise<unknown>;
}

export default function FilieresTable({
    data,
    currentPage,
    totalPages,
    searchTerm,
    onPageChange,
    onSearchChange,
    onCreate,
    onUpdate,
    onDelete
}: FilieresTableProps) {
    const [showModal, setShowModal] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newFiliere, setNewFiliere] = useState({ nom: '', description: '' });

    const filteredData = data;
    const startIndex = (currentPage - 1) * 10;

    const openCreate = () => {
        setEditingId(null);
        setFormError(null);
        setNewFiliere({ nom: '', description: '' });
        setShowModal(true);
    };

    const openEdit = (filiere: FiliereData) => {
        setEditingId(filiere.id);
        setFormError(null);
        setNewFiliere({ nom: filiere.nom, description: filiere.description ?? '' });
        setShowModal(true);
    };

    const handleDelete = async (filiere: FiliereData) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: `Voulez-vous vraiment supprimer la filière "${filiere.nom}" ?`,
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
            await onDelete(filiere.id);
            Swal.fire({
                title: 'Supprimé !',
                text: 'La filière a été supprimée avec succès.',
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
                await onUpdate(editingId, newFiliere.nom);
            } else {
                await onCreate(newFiliere.nom);
            }
            setShowModal(false);
            setEditingId(null);
            setNewFiliere({ nom: '', description: '' });
        } catch (err) {
            if (err instanceof ApiError) {
                setFormError(err.message);
            } else {
                setFormError('Impossible de sauvegarder la filière');
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
                <SearchInput
                    value={searchTerm}
                    onChange={onSearchChange}
                    placeholder="Rechercher une filière..."
                />
                <div style={{ display: 'flex', gap: '12px' }}>
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
                            boxShadow: '0 4px 12px rgba(91,141,239,0.3)'
                        }}
                    >
                        <Plus size={18} />
                        Ajouter
                    </button>
                </div>
            </div>

            <div className="table-container" style={{ overflowX: 'auto', padding: '0 40px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                    <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 100%)' }}>
                            <th style={{ padding: '16px', color: 'white', textAlign: 'center' }}>N°</th>
                            <th style={{ padding: '16px', color: 'white', textAlign: 'center' }}>Nom</th>
                            <th style={{ padding: '16px', color: 'white', textAlign: 'center' }}>Code</th>
                            <th style={{ padding: '16px', color: 'white', textAlign: 'center' }}>Description</th>
                            <th style={{ padding: '16px', color: 'white', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((filiere, index) => (
                            <tr key={filiere.id} style={{ background: index % 2 === 0 ? 'white' : '#fafbfc' }}>
                                <td style={{ padding: '16px', textAlign: 'center' }}>{startIndex + index + 1}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>{filiere.nom}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>{filiere.code}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>{filiere.description ?? 'Non renseigné'}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        {/* <button style={iconButtonStyle}>
                                            <Eye size={18} color="#5B8DEF" strokeWidth={2.5} />
                                        </button> */}
                                        <button style={iconButtonStyle} onClick={() => openEdit(filiere)}>
                                            <Pencil size={18} color="#5B8DEF" strokeWidth={2.5} />
                                        </button>
                                        <button style={iconButtonStyle} onClick={() => handleDelete(filiere)}>
                                            <Trash2 size={18} color="#5B8DEF" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={Math.max(totalPages, 1)} onPageChange={onPageChange} />

            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => { setShowModal(false); setEditingId(null); }}>
                    <div style={{
                        background: 'white', borderRadius: '20px', padding: '32px',
                        width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
                                {editingId ? 'Modifier une filière' : 'Ajouter une filière'}
                            </h2>
                            <button style={closeButtonStyle} onClick={() => { setShowModal(false); setEditingId(null); }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Nom</label>
                                <input
                                    type="text"
                                    value={newFiliere.nom}
                                    onChange={(e) => setNewFiliere(prev => ({ ...prev, nom: e.target.value }))}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    value={newFiliere.description}
                                    onChange={(e) => setNewFiliere(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'vertical' }}
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

const iconButtonStyle: React.CSSProperties = {
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
