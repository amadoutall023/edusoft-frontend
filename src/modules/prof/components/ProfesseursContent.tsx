'use client';

import React, { useEffect, useState, useRef } from 'react';
import ProfesseursTable from './ProfesseursTable';
import { ProfessorData, ProfessorFormData } from '../types';
import { fetchProfessors, createProfessor, deleteProfessor, importProfessorsFromExcel } from '../services/professorService';
import { ProfessorResponseDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';
import Swal from 'sweetalert2';
import { Upload, Plus, X, Pencil, Trash2, Eye } from 'lucide-react';

const mapProfessor = (prof: ProfessorResponseDto): ProfessorData => ({
    id: prof.professorId,
    professorId: prof.professorId,
    userId: prof.userId,
    prenom: prof.firstName,
    nom: prof.lastName,
    email: prof.email,
    username: prof.username,
    telephone: prof.telephone ?? undefined,
    specialite: prof.specialite ?? undefined,
    grade: prof.grade ?? undefined,
    schoolId: prof.schoolId ?? undefined,
    schoolName: prof.schoolName ?? undefined,
    roles: Array.from(prof.roles || []),
    modules: prof.modules?.map(m => ({ id: m.id, libelle: m.libelle })) || []
});

export default function ProfesseursContent() {
    const [professeurs, setProfesseurs] = useState<ProfessorData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProfessor, setSelectedProfessor] = useState<ProfessorData | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadProfessors = async () => {
        try {
            setIsLoading(true);
            const response = await fetchProfessors();
            setProfesseurs(response.map(mapProfessor));
            setError(null);
        } catch (err) {
            console.error('Unable to load professors', err);
            setError(err instanceof ApiError ? err.message : 'Impossible de charger les professeurs.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadProfessors();
    }, []);

    const handleAddProfessor = async (data: ProfessorFormData) => {
        setIsSubmitting(true);
        try {
            await createProfessor(data);
            await loadProfessors();
            setShowAddModal(false);
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Professeur ajouté avec succès!',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: err instanceof ApiError ? err.message : 'Erreur lors de la création du professeur',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProfessor = async (professor: ProfessorData) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: `Voulez-vous vraiment supprimer le professeur "${professor.prenom} ${professor.nom}" ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
        });

        if (!result.isConfirmed) return;

        try {
            await deleteProfessor(professor.id);
            await loadProfessors();
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Professeur supprimé avec succès!',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: err instanceof ApiError ? err.message : 'Erreur lors de la suppression du professeur',
            });
        }
    };

    const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const result = await importProfessorsFromExcel(file);
            await loadProfessors();
            Swal.fire({
                icon: 'success',
                title: 'Import terminé',
                text: `${result.imported} professeur(s) importé(s) sur ${result.total}`,
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: err instanceof ApiError ? err.message : 'Erreur lors de l\'importation',
            });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleViewDetails = (professor: ProfessorData) => {
        setSelectedProfessor(professor);
        setShowDetailsModal(true);
    };

    return (
        <>
            {/* Page Title */}
            <div className="page-title" style={{
                padding: '32px 40px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a202c',
                    margin: 0,
                    letterSpacing: '-0.5px'
                }}>Liste des Professeurs</h1>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportExcel}
                        accept=".xlsx,.xls,.csv"
                        style={{ display: 'none' }}
                        id="excel-import"
                    />
                    <label
                        htmlFor="excel-import"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: '#10b981',
                            color: 'white',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit',
                        }}
                    >
                        <Upload size={18} />
                        Importer Excel
                    </label>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: '#5B8DEF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit',
                        }}
                    >
                        <Plus size={18} />
                        Ajouter professeur
                    </button>
                </div>
            </div>

            {isLoading && (
                <div style={{ padding: '24px 40px', color: '#64748b' }}>
                    Chargement des professeurs...
                </div>
            )}

            {error && !isLoading && (
                <div style={{ padding: '24px 40px', color: '#dc2626' }}>
                    {error}
                </div>
            )}

            {!isLoading && !error && (
                <ProfesseursTable
                    data={professeurs}
                    onDelete={handleDeleteProfessor}
                    onViewDetails={handleViewDetails}
                />
            )}

            {/* Add Professor Modal */}
            {showAddModal && (
                <AddProfessorModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddProfessor}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedProfessor && (
                <ProfessorDetailsModal
                    professor={selectedProfessor}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedProfessor(null);
                    }}
                />
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    .page-title {
                        padding: 20px !important;
                    }
                    .page-title h1 {
                        fontSize: 22px !important;
                    }
                }
            `}</style>
        </>
    );
}

// Add Professor Modal Component
interface AddProfessorModalProps {
    onClose: () => void;
    onSubmit: (data: ProfessorFormData) => Promise<void>;
    isSubmitting: boolean;
}

function AddProfessorModal({ onClose, onSubmit, isSubmitting }: AddProfessorModalProps) {
    const [formData, setFormData] = useState<ProfessorFormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        grade: '',
        specialite: '',
        telephone: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div style={{
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
            padding: '20px',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1a202c' }}>
                        Ajouter un professeur
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                        }}
                    >
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                Prénom *
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #e5e7eb',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                Nom *
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #e5e7eb',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #e5e7eb',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                Mot de passe *
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #e5e7eb',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                Téléphone
                            </label>
                            <input
                                type="text"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #e5e7eb',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                Grade *
                            </label>
                            <select
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #e5e7eb',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                }}
                            >
                                <option value="">Sélectionner un grade</option>
                                <option value="Professeur">Professeur</option>
                                <option value="Maitre de conférences">Maitre de conférences</option>
                                <option value="Maitre assistant">Maitre assistant</option>
                                <option value="Doctorant">Doctorant</option>
                                <option value="Ingenieur">Ingénieur</option>
                                <option value="Master">Master</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                Spécialité
                            </label>
                            <input
                                type="text"
                                name="specialite"
                                value={formData.specialite}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #e5e7eb',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        marginTop: '24px',
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '12px 24px',
                                background: 'transparent',
                                border: '1.5px solid #e5e7eb',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                fontFamily: 'inherit',
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '12px 24px',
                                background: '#5B8DEF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                opacity: isSubmitting ? 0.7 : 1,
                                fontFamily: 'inherit',
                            }}
                        >
                            {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Professor Details Modal Component
interface ProfessorDetailsModalProps {
    professor: ProfessorData;
    onClose: () => void;
}

function ProfessorDetailsModal({ professor, onClose }: ProfessorDetailsModalProps) {
    return (
        <div style={{
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
            padding: '20px',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1a202c' }}>
                        Détails du professeur
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                        }}
                    >
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Prénom</label>
                            <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '500', color: '#1a202c' }}>{professor.prenom}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Nom</label>
                            <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '500', color: '#1a202c' }}>{professor.nom}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Username</label>
                            <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '500', color: '#1a202c' }}>{professor.username}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Email</label>
                            <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '500', color: '#1a202c' }}>{professor.email}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Téléphone</label>
                            <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '500', color: '#1a202c' }}>{professor.telephone || '-'}</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Grade</label>
                            <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '500', color: '#1a202c' }}>{professor.grade || '-'}</p>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Spécialité</label>
                        <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '500', color: '#1a202c' }}>{professor.specialite || '-'}</p>
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Modules enseignés</label>
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {professor.modules.length > 0 ? (
                                professor.modules.map((module, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#e0e7ff',
                                            color: '#4338ca',
                                            borderRadius: '16px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        {module.libelle}
                                    </span>
                                ))
                            ) : (
                                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>Aucun module assigné</p>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '24px',
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 24px',
                            background: '#5B8DEF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            fontFamily: 'inherit',
                        }}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
