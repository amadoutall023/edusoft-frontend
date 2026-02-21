'use client';

import React, { useState, useMemo } from 'react';
import { Eye, Plus, X, Pencil, Trash2 } from 'lucide-react';
import SearchInput from '@/shared/components/SearchInput';
import Pagination from '@/shared/components/Pagination';
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
    onCreate: (payload: ModulePayload) => Promise<void>;
    onUpdate: (id: string, payload: ModulePayload) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export default function ModulesTable({ data, filiereOptions, onCreate, onUpdate, onDelete }: ModulesTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        filiereId: '',
        classeId: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [newModule, setNewModule] = useState({ nom: '', code: '', credits: 0, filiereId: '' });
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const itemsPerPage = 3;

    // Get unique filieres and classes for filters
    const uniqueFilieres = useMemo(() =>
        [...new Set(data.map(item => item.filiereId))].sort(),
        [data]
    );

    const uniqueClasses = useMemo(() =>
        [...new Set(data.map(item => item.classeId).filter(Boolean))].sort(),
        [data]
    );

    // Filter data based on search term and filters
    const filteredData = data.filter(item => {
        const matchesSearch =
            item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFiliere = !filters.filiereId || item.filiereId === filters.filiereId;
        const matchesClasse = !filters.classeId || item.classeId === filters.classeId;

        return matchesSearch && matchesFiliere && matchesClasse;
    });

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

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
            setNewModule({ nom: '', code: '', credits: 0, filiereId: '' });
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
        setNewModule({ nom: '', code: '', credits: 0, filiereId: '' });
        setShowModal(true);
    };

    const openEdit = (module: ModuleData) => {
        setEditingId(module.id);
        setFormError(null);
        setNewModule({ nom: module.nom, code: module.code, credits: module.credits ?? 0, filiereId: module.filiereId });
        setShowModal(true);
    };

    const handleDelete = async (module: ModuleData) => {
        if (!window.confirm(`Supprimer le module ${module.nom} ?`)) {
            return;
        }
        try {
            await onDelete(module.id);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Suppression impossible';
            alert(message);
        }
    };

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ filiereId: '', classeId: '' });
    };

    const hasActiveFilters = filters.filiereId || filters.classeId;

    // Paginate data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
                                {(filters.filiereId ? 1 : 0) + (filters.classeId ? 1 : 0)}
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
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Filière</label>
                        <select
                            value={filters.filiereId}
                            onChange={(e) => handleFilterChange('filiereId', e.target.value)}
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
                            {uniqueFilieres.map(filiereId => (
                                <option key={filiereId} value={filiereId}>{filiereId}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Classe</label>
                        <select
                            value={filters.classeId}
                            onChange={(e) => handleFilterChange('classeId', e.target.value)}
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
                            {uniqueClasses.map(classeId => (
                                <option key={classeId} value={classeId}>{classeId}</option>
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
                                width: '150px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Classe</th>
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
                                }}>{module.classeId || '-'}</td>
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
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <button style={iconButtonStyle}>
                                            <Eye size={18} color="#5B8DEF" strokeWidth={2.5} />
                                        </button>
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

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Modal for adding new module */}
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
                            }}>{editingId ? 'Modifier un module' : 'Ajouter un module'}</h2>
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
                                    value={newModule.nom}
                                    onChange={(e) => setNewModule({ ...newModule, nom: e.target.value })}
                                    placeholder="Ex: Programmation Web"
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

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Code</label>
                                <input
                                    type="text"
                                    value={newModule.code}
                                    onChange={(e) => setNewModule({ ...newModule, code: e.target.value })}
                                    placeholder="Ex: WEB101"
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

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Crédits</label>
                                <input
                                    type="number"
                                    value={newModule.credits}
                                    onChange={(e) => setNewModule({ ...newModule, credits: parseInt(e.target.value) || 0 })}
                                    placeholder="Ex: 4"
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

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Filière</label>
                                <select
                                    value={newModule.filiereId}
                                    onChange={(e) => setNewModule({ ...newModule, filiereId: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        fontFamily: 'inherit',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}
                                    onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                                    onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                                >
                                    <option value="">Sélectionner une filière</option>
                                    {filiereOptions.map(filiere => (
                                        <option key={filiere.id} value={filiere.id}>{filiere.libelle}</option>
                                    ))}
                                </select>
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
    cursor: 'pointer',
    transition: 'all 0.2s ease'
};
