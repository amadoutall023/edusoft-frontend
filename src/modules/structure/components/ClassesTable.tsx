'use client';

import React, { useMemo, useState } from 'react';
import { Eye, Plus, X, Pencil, Trash2 } from 'lucide-react';
import SearchInput from '@/shared/components/SearchInput';
import FilterButton from '@/shared/components/FilterButton';
import Pagination from '@/shared/components/Pagination';
import { ClasseData, NiveauData } from '@/modules/structure/types';
import { ClassePayload } from '../services/structureService';
import { ApiError } from '@/shared/errors/ApiError';

interface OptionItem {
    id: string;
    libelle: string;
}

interface ClassesTableProps {
    data: ClasseData[];
    niveauxData?: NiveauData[];
    filiereOptions: OptionItem[];
    defaultSchoolId?: string | null;
    onCreate: (payload: ClassePayload) => Promise<void>;
    onUpdate: (id: string, payload: ClassePayload) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export default function ClassesTable({
    data,
    niveauxData = [],
    filiereOptions,
    defaultSchoolId,
    onCreate,
    onUpdate,
    onDelete
}: ClassesTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingClasseId, setEditingClasseId] = useState<string | null>(null);
    const [newClasse, setNewClasse] = useState({
        libelle: '',
        filiereId: '',
        niveauId: '',
        schoolId: defaultSchoolId ?? ''
    });
    const itemsPerPage = 5;

    React.useEffect(() => {
        setNewClasse(prev => ({ ...prev, schoolId: defaultSchoolId ?? '' }));
    }, [defaultSchoolId]);

    // Default niveaux if not provided
    const defaultNiveaux: NiveauData[] = niveauxData.length > 0 ? niveauxData : [
        { libelle: 'Première année' },
        { libelle: 'Deuxième année' },
        { libelle: 'Troisième année' },
        { libelle: 'Quatrième année' },
        { libelle: 'Cinquième année' },
    ];
    // Get filiere names for display
    const getFiliereName = (id: string) => id;

    // Get niveau name for display
    const getNiveauName = (libelle: string) => {
        return libelle;
    };

    // Filter data based on search term
    const filteredData = data.filter(item =>
        item.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.filiereId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.niveauId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginate data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!newClasse.schoolId) {
            setFormError('Aucune école associée au compte.');
            return;
        }
        try {
            setIsSubmitting(true);
            const payload = {
                libelle: newClasse.libelle,
                filiereId: newClasse.filiereId,
                niveauId: newClasse.niveauId,
                schoolId: newClasse.schoolId
            };
            if (editingClasseId) {
                await onUpdate(editingClasseId, payload);
            } else {
                await onCreate(payload);
            }
            setShowModal(false);
            setEditingClasseId(null);
            setNewClasse({ libelle: '', filiereId: '', niveauId: '', schoolId: defaultSchoolId ?? '' });
        } catch (err) {
            if (err instanceof ApiError) {
                setFormError(err.message);
            } else {
                setFormError('Impossible de sauvegarder la classe');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreateModal = () => {
        setEditingClasseId(null);
        setFormError(null);
        setNewClasse({ libelle: '', filiereId: '', niveauId: '', schoolId: defaultSchoolId ?? '' });
        setShowModal(true);
    };

    const openEditModal = (classe: ClasseData) => {
        setEditingClasseId(classe.id);
        setFormError(null);
        setNewClasse({
            libelle: classe.libelle,
            filiereId: classe.filiereId,
            niveauId: classe.niveauId,
            schoolId: classe.schoolId || defaultSchoolId || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (classe: ClasseData) => {
        if (!window.confirm(`Supprimer la classe ${classe.libelle} ?`)) {
            return;
        }
        try {
            await onDelete(classe.id);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Suppression impossible';
            alert(message);
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
                <div className="search-wrapper" style={{ flex: '1', minWidth: '200px', maxWidth: '400px' }}>
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Rechercher une classe..."
                    />
                </div>
                <div className="actions-wrapper" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <FilterButton label="Filtrer" />
                    <button
                        onClick={openCreateModal}
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
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '700px'
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
                                width: '60px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>N°</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '180px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Libellé</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '160px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Filière </th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '160px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>Niveau </th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                width: '140px',
                                borderBottom: '3px solid rgba(255,255,255,0.2)'
                            }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((classe, index) => (
                            <tr key={classe.id} style={{
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
                                }}>{classe.libelle}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: '#5B8DEF',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>{getFiliereName(classe.filiereId)}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: '#5B8DEF',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>{classe.niveauId}</td>
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
                                            onClick={() => openEditModal(classe)}
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
                                            onClick={() => handleDelete(classe)}
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

            {/* Modal for adding new class */}
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
                        setEditingClasseId(null);
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
                            }}>{editingClasseId ? 'Modifier une classe' : 'Ajouter une classe'}</h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingClasseId(null);
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
                                }}>Libellé</label>
                                <input
                                    type="text"
                                    value={newClasse.libelle}
                                    onChange={(e) => setNewClasse({ ...newClasse, libelle: e.target.value })}
                                    placeholder="Ex: Classe A1"
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
                                }}>Filière</label>
                                <select
                                    value={newClasse.filiereId}
                                    onChange={(e) => setNewClasse({ ...newClasse, filiereId: e.target.value })}
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
                                    {filiereOptions.map((filiere) => (
                                        <option key={filiere.id} value={filiere.id}>
                                            {filiere.libelle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Niveau</label>
                                <select
                                    value={newClasse.niveauId}
                                    onChange={(e) => setNewClasse({ ...newClasse, niveauId: e.target.value })}
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
                                    <option value="">Sélectionner un niveau</option>
                                    {defaultNiveaux.map((niveau, index) => (
                                        <option key={index} value={niveau.id ?? niveau.libelle}>
                                            {niveau.libelle}
                                        </option>
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
                                        setEditingClasseId(null);
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

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
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
            `}</style>
        </>
    );
}
