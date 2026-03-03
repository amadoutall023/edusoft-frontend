'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { 
    Calendar, 
    Plus, 
    CheckCircle, 
    XCircle, 
    Trash2, 
    Edit, 
    RefreshCw,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { AnneeScolaire, AnneeScolaireFormData } from '../types/anneeScolaire';
import { 
    fetchAnneeScolaire, 
    createAnneeScolaire, 
    updateAnneeScolaire,
    activateAnneeScolaire, 
    deactivateAnneeScolaire,
    deleteAnneeScolaire 
} from '../services/anneeScolaireService';
import { ApiError } from '@/shared/errors/ApiError';

interface AnneeScolaireManagerProps {
    onYearChanged?: () => void;
}

export default function AnneeScolaireManager({ onYearChanged }: AnneeScolaireManagerProps) {
    const [annees, setAnnees] = useState<AnneeScolaire[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingYear, setEditingYear] = useState<AnneeScolaire | null>(null);
    const [formData, setFormData] = useState<AnneeScolaireFormData>({
        annee: '',
        dateDebut: '',
        dateFin: '',
        description: ''
    });

    const loadAnnees = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchAnneeScolaire();
            setAnnees(data);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Impossible de charger les années scolaires');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAnnees();
    }, [loadAnnees]);

    const handleOpenModal = (year?: AnneeScolaire) => {
        if (year) {
            setEditingYear(year);
            setFormData({
                annee: year.annee,
                dateDebut: year.dateDebut.split('T')[0],
                dateFin: year.dateFin.split('T')[0],
                description: year.description || ''
            });
        } else {
            setEditingYear(null);
            // Default to next academic year (2026-2027 for current 2025-2026)
            const currentYear = new Date().getFullYear();
            setFormData({
                annee: `${currentYear + 1}-${currentYear + 2}`,
                dateDebut: `${currentYear + 1}-09-01`,
                dateFin: `${currentYear + 2}-07-31`,
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingYear(null);
        setFormData({
            annee: '',
            dateDebut: '',
            dateFin: '',
            description: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setError(null);
            setSuccess(null);

            if (editingYear) {
                await updateAnneeScolaire(editingYear.id, formData);
                setSuccess('Année scolaire mise à jour avec succès');
            } else {
                await createAnneeScolaire(formData);
                setSuccess('Année scolaire créée avec succès');
            }
            
            handleCloseModal();
            await loadAnnees();
            onYearChanged?.();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Une erreur est survenue');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleActivate = async (id: string) => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccess(null);
            await activateAnneeScolaire(id);
            setSuccess('Année scolaire activée avec succès');
            await loadAnnees();
            onYearChanged?.();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Impossible d\'activer l\'année scolaire');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeactivate = async (id: string) => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccess(null);
            await deactivateAnneeScolaire(id);
            setSuccess('Année scolaire désactivée avec succès');
            await loadAnnees();
            onYearChanged?.();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Impossible de désactiver l\'année scolaire');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Vous ne pourrez pas récupérer cette année scolaire !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        });
        if (!result.isConfirmed) {
            return;
        }
        try {
            setIsSaving(true);
            setError(null);
            setSuccess(null);
            await deleteAnneeScolaire(id);
            setSuccess('Année scolaire supprimée avec succès');
            await loadAnnees();
            onYearChanged?.();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Impossible de supprimer l\'année scolaire');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Trier les années par date de début (plus récent en premier)
    const sortedAnnees = [...annees].sort((a, b) => 
        new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
    );

    return (
        <div className="annee-scolaire-manager">
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#1a202c',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Calendar size={24} />
                        Années Scolaires
                    </h2>
                    <p style={{ 
                        marginTop: '4px', 
                        color: '#64748b', 
                        fontSize: '14px' 
                    }}>
                        Gerez les annees scolaires de l'etablissement
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => loadAnnees()}
                        disabled={isLoading || isSaving}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'white',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: isLoading || isSaving ? 'not-allowed' : 'pointer',
                            opacity: isLoading || isSaving ? 0.7 : 1
                        }}
                    >
                        <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                        Actualiser
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        disabled={isSaving}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            opacity: isSaving ? 0.7 : 1,
                            boxShadow: '0 2px 8px rgba(91,141,239,0.3)'
                        }}
                    >
                        <Plus size={16} />
                        Nouvelle année
                    </button>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    padding: '12px 16px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    color: '#16a34a',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#64748b' 
                }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '12px' }}>Chargement des années scolaires...</p>
                </div>
            )}

            {/* Table */}
            {!isLoading && sortedAnnees.length > 0 && (
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr style={{
                                background: '#f8fafc',
                                borderBottom: '1px solid #e2e8f0'
                            }}>
                                <th style={{
                                    padding: '14px 16px',
                                    textAlign: 'left',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Année</th>
                                <th style={{
                                    padding: '14px 16px',
                                    textAlign: 'left',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Date début</th>
                                <th style={{
                                    padding: '14px 16px',
                                    textAlign: 'left',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Date fin</th>
                                <th style={{
                                    padding: '14px 16px',
                                    textAlign: 'left',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Statut</th>
                                <th style={{
                                    padding: '14px 16px',
                                    textAlign: 'right',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAnnees.map((annee, index) => (
                                <tr key={annee.id} style={{
                                    borderBottom: index < sortedAnnees.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    transition: 'background 0.2s'
                                }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{
                                            fontWeight: '600',
                                            color: '#1e293b',
                                            fontSize: '15px'
                                        }}>
                                            {annee.annee}
                                        </div>
                                        {annee.description && (
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#64748b',
                                                marginTop: '2px'
                                            }}>
                                                {annee.description}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px', color: '#475569' }}>
                                        {formatDate(annee.dateDebut)}
                                    </td>
                                    <td style={{ padding: '16px', color: '#475569' }}>
                                        {formatDate(annee.dateFin)}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background: annee.isCurrent ? '#dcfce7' : '#f1f5f9',
                                            color: annee.isCurrent ? '#16a34a' : '#64748b'
                                        }}>
                                            {annee.isCurrent ? (
                                                <>
                                                    <CheckCircle size={14} />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={14} />
                                                    Inactive
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: '8px'
                                        }}>
                                            {annee.actif ? (
                                                <button
                                                    onClick={() => handleDeactivate(annee.id)}
                                                    disabled={isSaving}
                                                    title="Désactiver"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '36px',
                                                        height: '36px',
                                                        background: '#fef3c7',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                                        color: '#d97706',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivate(annee.id)}
                                                    disabled={isSaving}
                                                    title="Activer"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '36px',
                                                        height: '36px',
                                                        background: '#dcfce7',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                                        color: '#16a34a',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleOpenModal(annee)}
                                                disabled={isSaving}
                                                title="Modifier"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '36px',
                                                    height: '36px',
                                                    background: '#eff6ff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                                    color: '#2563eb',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(annee.id)}
                                                disabled={isSaving || annee.actif}
                                                title={annee.actif ? "Impossible de supprimer une année active" : "Supprimer"}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '36px',
                                                    height: '36px',
                                                    background: annee.actif ? '#f1f5f9' : '#fef2f2',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: isSaving || annee.actif ? 'not-allowed' : 'pointer',
                                                    color: annee.actif ? '#cbd5e1' : '#dc2626',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && sortedAnnees.length === 0 && (
                <div style={{
                    padding: '60px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px dashed #e2e8f0'
                }}>
                    <Calendar size={48} style={{ color: '#cbd5e1', margin: '0 auto' }} />
                    <h3 style={{
                        marginTop: '16px',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#475569'
                    }}>
                        Aucune année scolaire
                    </h3>
                    <p style={{
                        marginTop: '8px',
                        color: '#94a3b8',
                        fontSize: '14px'
                    }}>
                        Cliquez sur "Nouvelle annee" pour creer la premiere annee scolaire
                    </p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#1e293b',
                                margin: 0
                            }}>
                                {editingYear ? 'Modifier l\'année scolaire' : 'Nouvelle année scolaire'}
                            </h2>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '6px'
                                    }}>
                                        Année scolaire *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.annee}
                                        onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                                        placeholder="Ex: 2025-2026"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '6px'
                                        }}>
                                            Date de début *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.dateDebut}
                                            onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '6px'
                                        }}>
                                            Date de fin *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.dateFin}
                                            onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '6px'
                                    }}>
                                        Description (optionnel)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Description de l'année scolaire..."
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>
                            
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={isSaving}
                                    style={{
                                        padding: '10px 20px',
                                        background: 'white',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        cursor: isSaving ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    style={{
                                        padding: '10px 20px',
                                        background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: 'white',
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {isSaving ? (
                                        <>
                                            <RefreshCw size={16} className="spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        editingYear ? 'Mettre à jour' : 'Créer'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                tr:hover {
                    background: #f8fafc !important;
                }
            `}</style>
        </div>
    );
}
