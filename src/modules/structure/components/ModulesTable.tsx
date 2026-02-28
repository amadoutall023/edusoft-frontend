'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import SearchInput from '@/shared/components/SearchInput';
import Pagination from '@/shared/components/Pagination';
import TableCard from '@/shared/components/TableCard';
import { ModuleData } from '../types';
import { ApiError } from '@/shared/errors/ApiError';
import { ModulePayload } from '../services/structureService';

interface OptionItem {
    id: string;
    libelle: string;
}

interface ModulesTableProps {
    data: ModuleData[];
    filiereOptions: OptionItem[];
    currentPage: number;
    totalPages: number;
    searchTerm: string;
    selectedFiliereId: string;
    onPageChange: (page: number) => void;
    onSearchChange: (value: string) => void;
    onFiliereFilterChange: (filiereId: string) => void;
    onCreate: (payload: ModulePayload) => Promise<unknown>;
    onUpdate: (id: string, payload: ModulePayload) => Promise<unknown>;
    onDelete: (id: string) => Promise<unknown>;
}

export default function ModulesTable({
    data,
    filiereOptions,
    currentPage,
    totalPages,
    searchTerm,
    selectedFiliereId,
    onPageChange,
    onSearchChange,
    onFiliereFilterChange,
    onCreate,
    onUpdate,
    onDelete
}: ModulesTableProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        filiereId: selectedFiliereId
    });
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
    const [newModule, setNewModule] = useState({ nom: '', credits: 0, filiereId: '' });
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

    useEffect(() => {
        setFilters(prev => ({ ...prev, filiereId: selectedFiliereId }));
    }, [selectedFiliereId]);

    const uniqueFilieres = useMemo(
        () => filiereOptions.map(option => ({ id: option.id, label: option.libelle })),
        [filiereOptions]
    );

    const filteredData = data;

    useEffect(() => {
        onFiliereFilterChange(filters.filiereId);
    }, [filters.filiereId, onFiliereFilterChange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        try {
            setIsSubmitting(true);
            const payload: ModulePayload = {
                libelle: newModule.nom,
                filiereId: newModule.filiereId || undefined
            };
            if (editingId) {
                await onUpdate(editingId, payload);
            } else {
                await onCreate(payload);
            }
            setShowModal(false);
            setEditingId(null);
            setNewModule({ nom: '', credits: 0, filiereId: '' });
        } catch (err) {
            if (err instanceof ApiError) {
                setFormError(err.message);
            } else {
                setFormError('Impossible de sauvegarder le module');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreate = () => {
        setEditingId(null);
        setFormError(null);
        setNewModule({ nom: '', credits: 0, filiereId: '' });
        setShowModal(true);
    };

    const openEdit = (module: ModuleData) => {
        setEditingId(module.id);
        setFormError(null);
        setNewModule({ nom: module.nom, credits: module.credits ?? 0, filiereId: module.filiereId });
        setShowModal(true);
    };

    const handleDelete = async (module: ModuleData) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: `Voulez-vous vraiment supprimer le module "${module.nom}" ?`,
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
            await onDelete(module.id);
            Swal.fire({
                title: 'Supprimé !',
                text: 'Le module a été supprimé avec succès.',
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

    const handleViewDetails = (module: ModuleData) => {
        setSelectedModule(module);
        setShowDetailsModal(true);
    };

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ filiereId: '' });
    };

    const hasActiveFilters = !!filters.filiereId;
    const startIndex = (currentPage - 1) * 10;

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
                <SearchInput
                    value={searchTerm}
                    onChange={(value) => onSearchChange(value)}
                    placeholder="Rechercher un module..."
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: showFilters ? '#5B8DEF' : 'white',
                            border: `1.5px solid ${showFilters ? '#5B8DEF' : '#e5e7eb'}`,
                            borderRadius: '10px',
                            color: showFilters ? 'white' : '#4a5568',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Filtrer
                        {hasActiveFilters && (
                            <span style={{
                                background: showFilters ? 'white' : '#5B8DEF',
                                color: showFilters ? '#5B8DEF' : 'white',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                {(filters.filiereId ? 1 : 0)}
                            </span>
                        )}
                    </button>
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
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Filière</label>
                        <select
                            value={filters.filiereId}
                            onChange={(e) => {
                                handleFilterChange('filiereId', e.target.value);
                                onPageChange(1);
                            }}
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
                            <option value="">Toutes les filières</option>
                            {uniqueFilieres.map(filiere => (
                                <option key={filiere.id} value={filiere.id}>{filiere.label}</option>
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

            {/* Table - Desktop only */}
            {!isMobile && (
                <div className="table-container" style={{ overflowX: 'auto', padding: '0 40px' }}>
                    <table className="desktop-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 100%)', borderRadius: '12px 12px 0 0' }}>
                                <th style={{ padding: '16px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '14px', width: '80px', borderBottom: '3px solid rgba(255,255,255,0.2)' }}>N°</th>
                                <th style={{ padding: '16px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '14px', width: '200px', borderBottom: '3px solid rgba(255,255,255,0.2)' }}>Nom</th>
                                <th style={{ padding: '16px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '14px', width: '150px', borderBottom: '3px solid rgba(255,255,255,0.2)' }}>Code</th>
                                <th style={{ padding: '16px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '14px', width: '150px', borderBottom: '3px solid rgba(255,255,255,0.2)' }}>Filière</th>
                                <th style={{ padding: '16px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '14px', width: '150px', borderBottom: '3px solid rgba(255,255,255,0.2)' }}>Classe</th>
                                <th style={{ padding: '16px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '14px', width: '120px', borderBottom: '3px solid rgba(255,255,255,0.2)' }}>Crédits</th>
                                <th style={{ padding: '16px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '14px', width: '120px', borderBottom: '3px solid rgba(255,255,255,0.2)' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((module, index) => (
                                <tr key={module.id} style={{ background: index % 2 === 0 ? 'white' : '#fafbfc', transition: 'all 0.2s ease' }}
                                    onMouseEnter={(e: any) => { e.currentTarget.style.background = '#f0f7ff'; e.currentTarget.style.transform = 'scale(1.002)'; }}
                                    onMouseLeave={(e: any) => { e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafbfc'; e.currentTarget.style.transform = 'scale(1)'; }}
                                >
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#4a5568', fontSize: '14px', fontWeight: '500', borderBottom: '1px solid #f1f5f9' }}>{startIndex + index + 1}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#1a202c', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>{module.nom}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#5B8DEF', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>{module.code}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#5B8DEF', fontSize: '14px', fontWeight: '500', borderBottom: '1px solid #f1f5f9' }}>{module.filiereLabel ?? module.filiereId}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#4a5568', fontSize: '14px', fontWeight: '500', borderBottom: '1px solid #f1f5f9' }}>{module.classeId || '-'}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#4a5568', fontSize: '14px', fontWeight: '500', borderBottom: '1px solid #f1f5f9' }}>{module.credits}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button style={iconButtonStyle} onClick={() => openEdit(module)}>
                                                <Pencil size={18} color="#5B8DEF" strokeWidth={2.5} />
                                            </button>
                                            <button style={iconButtonStyle} onClick={() => handleDelete(module)}>
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
                <div className="mobile-cards" style={{ padding: '16px', overflowX: 'hidden', maxWidth: '100vw', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {filteredData.map((module, index) => (
                        <div key={module.id} style={{ width: '100%', maxWidth: '420px' }}>
                            <TableCard
                                index={index}
                                variant="classe"
                                fields={[
                                    { label: 'Nom', value: module.nom, highlight: true },
                                    { label: 'Code', value: module.code },
                                    { label: 'Filière', value: module.filiereLabel || module.filiereId },
                                    { label: 'Crédits', value: (module.credits ?? 0).toString() }
                                ]}
                                onEdit={() => openEdit(module)}
                                onDelete={() => handleDelete(module)}
                            />
                        </div>
                    ))}
                    {filteredData.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                            Aucun module trouvé
                        </div>
                    )}
                </div>
            )}

            <Pagination currentPage={currentPage} totalPages={Math.max(totalPages, 1)} onPageChange={onPageChange} />

            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
                    onClick={() => { setShowModal(false); setEditingId(null); }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a202c', margin: 0 }}>{editingId ? 'Modifier un module' : 'Ajouter un module'}</h2>
                            <button style={closeButtonStyle} onClick={() => { setShowModal(false); setEditingId(null); }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Nom</label>
                                <input type="text" value={newModule.nom} onChange={(e) => setNewModule({ ...newModule, nom: e.target.value })} placeholder="Ex: Programmation Web" required style={inputStyle} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Crédits</label>
                                <input type="number" value={newModule.credits} onChange={(e) => setNewModule({ ...newModule, credits: parseInt(e.target.value) || 0 })} placeholder="Ex: 4" min="0" required style={inputStyle} />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Filière</label>
                                <select value={newModule.filiereId} onChange={(e) => setNewModule({ ...newModule, filiereId: e.target.value })} required style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="">Sélectionner une filière</option>
                                    {filiereOptions.map(filiere => (
                                        <option key={filiere.id} value={filiere.id}>{filiere.libelle}</option>
                                    ))}
                                </select>
                            </div>
                            {formError && <div style={{ color: '#dc2626', marginBottom: '12px', fontSize: '13px' }}>{formError}</div>}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} style={cancelButtonStyle}>Annuler</button>
                                <button type="submit" disabled={isSubmitting} style={submitButtonStyle(isSubmitting)}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedModule && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setShowDetailsModal(false)}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a202c', margin: 0 }}>Détails du module</h2>
                            <button style={closeButtonStyle} onClick={() => setShowDetailsModal(false)}>
                                <X size={24} color="#94a3b8" />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Nom du module</label>
                                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a202c', margin: 0 }}>{selectedModule.nom}</p>
                            </div>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Code</label>
                                <p style={{ fontSize: '16px', fontWeight: 600, color: '#5B8DEF', margin: 0 }}>{selectedModule.code}</p>
                            </div>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Filière</label>
                                <p style={{ fontSize: '16px', fontWeight: 500, color: '#1a202c', margin: 0 }}>{selectedModule.filiereLabel || 'Non défini'}</p>
                            </div>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Crédits</label>
                                <p style={{ fontSize: '16px', fontWeight: 500, color: '#1a202c', margin: 0 }}>{selectedModule.credits ?? 0}</p>
                            </div>
                            {selectedModule.classeId && (
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Classe</label>
                                    <p style={{ fontSize: '16px', fontWeight: 500, color: '#1a202c', margin: 0 }}>{selectedModule.classeId}</p>
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowDetailsModal(false)} style={submitButtonStyle(false)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const iconButtonStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#E3F2FD', cursor: 'pointer', transition: 'all 0.2s ease' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#4a5568', marginBottom: '8px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', fontFamily: 'inherit' };
const closeButtonStyle: React.CSSProperties = { width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cancelButtonStyle: React.CSSProperties = { padding: '12px 24px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer' };
const submitButtonStyle = (disabled: boolean): React.CSSProperties => ({ padding: '12px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1, boxShadow: '0 4px 12px rgba(91,141,239,0.3)' });

const Styles = () => (
    <style jsx>{`
        @media (min-width: 769px) {
            div.mobile-cards { display: none !important; }
        }
        @media (max-width: 768px) {
            div.search-filter-section { padding: 16px !important; }
            div.filter-panel { padding: 16px !important; }
            div.table-container { display: none !important; }
            table.desktop-table { display: none !important; }
            div.mobile-cards { display: flex !important; flex-direction: column !important; align-items: center !important; padding: 16px !important; overflow-x: hidden !important; width: 100% !important; max-width: 100vw !important; }
        }
    `}</style>
);
