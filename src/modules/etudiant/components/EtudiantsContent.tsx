'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {  Plus,  Eye, X, Trash2, Edit2, FileSpreadsheet, QrCode, School } from 'lucide-react';
import Swal from 'sweetalert2';
import SearchInput from '@/shared/components/SearchInput';
import Pagination from '@/shared/components/Pagination';
import { Etudiant, EtudiantFormData } from '../types';
import { fetchClasses } from '@/modules/structure/services/structureService';
import { 
    fetchStudents, 
    createStudent, 
    updateStudent, 
    deleteStudent, 
    importStudentsFromExcel,
    generateMatricule,
    assignStudentToClasse,
    removeStudentFromClasse
} from '../services/studentService';
import { StudentResponseDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';

const buildClasseLabel = (classe?: StudentResponseDto['classe']) => {
    if (!classe) return null;
    const parts = [
        classe.libelle ?? '',
        classe.niveau?.libelle ? ` - ${classe.niveau.libelle}` : '',
        classe.filiere?.libelle ? ` (${classe.filiere.libelle})` : ''
    ];
    return parts.join('').trim();
};

const mapStudent = (student: StudentResponseDto): Etudiant => ({
    id: student.id,
    matricule: student.matricule,
    firstName: student.firstName ?? '',
    lastName: student.lastName ?? '',
    email: student.email ?? '',
    phone: student.phone ?? '',
    dateOfBirth: student.dateOfBirth ?? undefined,
    lieuNaissance: student.lieuNaissance ?? undefined,
    nationalite: student.nationalite ?? undefined,
    address: student.address ?? undefined,
    gender: student.gender ?? undefined,
    classe: buildClasseLabel(student.classe),
    classeInfo: {
        id: student.classe?.id ?? null,
        libelle: student.classe?.libelle ?? null,
        filiere: student.classe?.filiere ? {
            id: student.classe.filiere.id ?? '',
            libelle: student.classe.filiere.libelle ?? ''
        } : null,
        niveau: student.classe?.niveau ? {
            id: student.classe.niveau.id ?? '',
            libelle: student.classe.niveau.libelle ?? ''
        } : null
    },
    anneeInscription: student.anneeInscription ?? undefined,
    qrToken: student.qrToken ?? undefined,
    qrCodeImage: student.qrCodeImage ?? undefined,
    createdAt: student.createdAt ?? undefined,
    updatedAt: student.updatedAt ?? undefined
});

export default function EtudiantsContent() {
    const [students, setStudents] = useState<Etudiant[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
    const [editingEtudiant, setEditingEtudiant] = useState<Etudiant | null>(null);
    const [filters, setFilters] = useState({
        classe: '',
        anneeInscription: '',
        gender: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importingFile, setImportingFile] = useState(false);
    const [classes, setClasses] = useState<{id: string, libelle: string}[]>([]);

    // Load classes for the dropdown

    // Form state
    const [formData, setFormData] = useState<EtudiantFormData>({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        lieuNaissace: '',
        nationalite: '',
        address: '',
        phone: '',
        gender: '',
        classeId: ''
    });

    const itemsPerPage = 5;

    useEffect(() => {
        loadStudents();
        loadClasses();
    }, []);

    const loadStudents = async () => {
        try {
            setIsLoading(true);
            const response = await fetchStudents({ page: 0, size: 100 });
            setStudents(response.content.map(mapStudent));
            setError(null);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Impossible de charger les étudiants.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loadClasses = async () => {
        try {
            const classesData = await fetchClasses(100);
            setClasses(classesData.map((c: any) => ({ id: c.id, libelle: c.libelle })));
        } catch (err) {
            console.error('Erreur lors du chargement des classes:', err);
        }
    };

    const uniqueClasses = useMemo(
        () => [...new Set(students.map(item => item.classe).filter(Boolean))].sort(),
        [students]
    );

    const uniqueAnnees = useMemo(
        () => [...new Set(students.map(item => item.anneeInscription).filter(Boolean))].sort((a, b) => (b ?? 0) - (a ?? 0)),
        [students]
    );

    const filteredData = students.filter(item => {
        const matchesSearch =
            item.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.phone ?? '').includes(searchTerm);

        const matchesClasse = !filters.classe || item.classe === filters.classe;
        const matchesAnnee = !filters.anneeInscription || item.anneeInscription === parseInt(filters.anneeInscription, 10);
        const matchesGender = !filters.gender || item.gender === filters.gender;

        return matchesSearch && matchesClasse && matchesAnnee && matchesGender;
    });

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ classe: '', anneeInscription: '', gender: '' });
    };

    const hasActiveFilters = filters.classe || filters.anneeInscription || filters.gender;

    const handleImportClick = () => {
        setShowImportModal(true);
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setImportingFile(true);
            const result = await importStudentsFromExcel(file, true);
            setSuccessMessage(`Importation terminée: ${result.successCount} étudiants importés, ${result.skipCount} ignorés, ${result.errorCount} erreurs`);
            await loadStudents();
            setShowImportModal(false);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Erreur lors de l\'importation');
        } finally {
            setImportingFile(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createStudent(formData);
            setSuccessMessage('Étudiant créé avec succès');
            setShowAddModal(false);
            resetForm();
            await loadStudents();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Erreur lors de la création');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEtudiant) return;
        
        setIsSubmitting(true);
        try {
            await updateStudent(editingEtudiant.id, formData);
            setSuccessMessage('Étudiant mis à jour avec succès');
            setShowEditModal(false);
            setEditingEtudiant(null);
            resetForm();
            await loadStudents();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEtudiant = async (id: string) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: 'Voulez-vous vraiment supprimer cet étudiant ?',
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
            await deleteStudent(id);
            Swal.fire({
                title: 'Supprimé !',
                text: 'L\'étudiant a été supprimé avec succès.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            await loadStudents();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Erreur lors de la suppression';
            Swal.fire({
                title: 'Erreur',
                text: message,
                icon: 'error'
            });
        }
    };

    const handleAssignClasse = async (student: Etudiant) => {
        const { value: classeId } = await Swal.fire({
            title: 'Assigner à une classe',
            input: 'select',
            inputOptions: classes.reduce((acc, classe) => {
                acc[classe.id] = classe.libelle;
                return acc;
            }, {} as Record<string, string>),
            inputPlaceholder: 'Sélectionner une classe',
            showCancelButton: true,
            confirmButtonText: 'Assigner',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!classeId) return;

        try {
            await assignStudentToClasse(student.id, classeId);
            Swal.fire({
                title: 'Succès !',
                text: 'Étudiant assigné à la classe avec succès.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            await loadStudents();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Erreur lors de l\'assignation';
            Swal.fire({
                title: 'Erreur',
                text: message,
                icon: 'error'
            });
        }
    };

    const openEditModal = (etudiant: Etudiant) => {
        setEditingEtudiant(etudiant);
        setFormData({
            username: '',
            email: etudiant.email ?? '',
            password: '',
            firstName: etudiant.firstName ?? '',
            lastName: etudiant.lastName ?? '',
            dateOfBirth: etudiant.dateOfBirth ?? '',
            lieuNaissace: etudiant.lieuNaissance ?? '',
            nationalite: etudiant.nationalite ?? '',
            address: etudiant.address ?? '',
            phone: etudiant.phone ?? '',
            gender: etudiant.gender ?? '',
            classeId: etudiant.classeInfo?.id ?? ''
        });
        setShowEditModal(true);
    };

    const openQRModal = (etudiant: Etudiant) => {
        setSelectedEtudiant(etudiant);
        setShowQRModal(true);
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            lieuNaissace: '',
            nationalite: '',
            address: '',
            phone: '',
            gender: '',
            classeId: ''
        });
    };

    // Auto-generate matricule preview when adding
    const [matriculePreview, setMatriculePreview] = useState('');
    useEffect(() => {
        const getPreview = async () => {
            try {
                const mat = await generateMatricule();
                setMatriculePreview(mat);
            } catch {
                // ignore
            }
        };
        if (showAddModal) {
            getPreview();
        }
    }, [showAddModal]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 80px)',
            background: '#f8fafc',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 24px 12px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                background: 'white',
                flexShrink: 0
            }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1a202c',
                    margin: 0,
                    letterSpacing: '-0.5px'
                }}>Liste des Étudiants</h1>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleImportClick}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'white',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: '10px',
                            color: '#4a5568',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit'
                        }}
                    >
                        <FileSpreadsheet size={16} />
                        Importer Excel
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowAddModal(true); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(91,141,239,0.3)',
                            fontFamily: 'inherit'
                        }}
                    >
                        <Plus size={16} />
                        Ajouter étudiant
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div style={{
                padding: '12px 24px',
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
                    placeholder="Rechercher un étudiant..."
                />
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 18px',
                        background: showFilters ? '#5B8DEF' : 'white',
                        border: `1.5px solid ${showFilters ? '#5B8DEF' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        color: showFilters ? 'white' : '#4a5568',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit'
                    }}
                >
                    <span>Filtrer</span>
                    {hasActiveFilters && (
                        <span style={{
                            background: 'white',
                            color: '#5B8DEF',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {[filters.classe, filters.anneeInscription, filters.gender].filter(Boolean).length}
                        </span>
                    )}
                </button>
            </div>

            {showFilters && (
                <div style={{
                    padding: '16px 24px',
                    background: '#edf2ff',
                    borderBottom: '1px solid #cbd5f5',
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Classe</label>
                        <select
                            value={filters.classe}
                            onChange={(e) => handleFilterChange('classe', e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5f5', marginTop: '6px' }}
                        >
                            <option value="">Toutes les classes</option>
                            {uniqueClasses.map(classe => (
                                <option key={classe} value={classe}>{classe}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Année</label>
                        <select
                            value={filters.anneeInscription}
                            onChange={(e) => handleFilterChange('anneeInscription', e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5f5', marginTop: '6px' }}
                        >
                            <option value="">Toutes les années</option>
                            {uniqueAnnees.map(annee => (
                                <option key={annee ?? 'unknown'} value={annee ?? ''}>{annee}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Genre</label>
                        <select
                            value={filters.gender}
                            onChange={(e) => handleFilterChange('gender', e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5f5', marginTop: '6px' }}
                        >
                            <option value="">Tous</option>
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            style={{
                                alignSelf: 'flex-end',
                                padding: '10px 16px',
                                border: 'none',
                                background: '#ef4444',
                                color: 'white',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Effacer
                        </button>
                    )}
                </div>
            )}

            {/* Success/Error Messages */}
            {successMessage && (
                <div style={{ padding: '12px 24px', background: '#dcfce7', color: '#166534', borderBottom: '1px solid #86efac' }}>
                    {successMessage}
                    <button onClick={() => setSuccessMessage(null)} style={{ marginLeft: '16px', border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
                </div>
            )}
            {error && (
                <div style={{ padding: '12px 24px', background: '#fee2e2', color: '#dc2626', borderBottom: '1px solid #fecaca' }}>
                    {error}
                    <button onClick={() => setError(null)} style={{ marginLeft: '16px', border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            {/* Table */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {isLoading && (
                    <div style={{ padding: '24px', color: '#64748b' }}>Chargement des étudiants...</div>
                )}

                {!isLoading && (
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['Matricule', 'Nom & Prénom', 'Classe', 'Année', 'Genre', 'Actions'].map((header) => (
                                        <th key={header} style={{
                                            textAlign: 'left',
                                            padding: '12px 16px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#475569',
                                            borderBottom: '1px solid #e2e8f0'
                                        }}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((etudiant, index) => (
                                    <tr key={etudiant.id} style={{
                                        background: index % 2 === 0 ? 'white' : '#fefefe',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '600' }}>{etudiant.matricule}</td>
                                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                                            <div style={{ fontWeight: 600 }}>{etudiant.firstName} {etudiant.lastName}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{etudiant.email}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: '13px' }}>{etudiant.classe ?? '—'}</td>
                                        <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: '13px' }}>{etudiant.anneeInscription ?? '—'}</td>
                                        <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: '13px' }}>{etudiant.gender === 'M' ? 'Masculin' : etudiant.gender === 'F' ? 'Féminin' : '—'}</td>
                                        <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => openQRModal(etudiant)}
                                                title="QR Code"
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <QrCode size={16} color="#5B8DEF" />
                                            </button>
                                            <button
                                                onClick={() => setSelectedEtudiant(etudiant)}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Eye size={16} color="#0f172a" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(etudiant)}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Edit2 size={16} color="#0f172a" />
                                            </button>
                                            <button
                                                onClick={() => handleAssignClasse(etudiant)}
                                                title="Assigner à une classe"
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #dbeafe',
                                                    background: '#dbeafe',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <School size={16} color="#2563eb" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEtudiant(etudiant.id)}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #fee2e2',
                                                    background: '#fee2e2',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Trash2 size={16} color="#dc2626" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!isLoading && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal" style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15,23,42,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '540px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        position: 'relative',
                        boxShadow: '0 20px 60px rgba(15,23,42,0.25)'
                    }}>
                        <button
                            onClick={() => { setShowAddModal(false); resetForm(); }}
                            style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                            <X size={18} color="#94a3b8" />
                        </button>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>Ajouter un étudiant</h3>
                        {matriculePreview && (
                            <div style={{ marginBottom: '16px', padding: '8px 12px', background: '#f0f9ff', borderRadius: '8px', fontSize: '13px' }}>
                                Matricule généré: <strong>{matriculePreview}</strong>
                            </div>
                        )}
                        <form onSubmit={handleAddStudent}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input
                                    type="text"
                                    placeholder="Prénom *"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Nom *"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <input
                                    type="email"
                                    placeholder="Email *"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <input
                                    type="password"
                                    placeholder="Mot de passe *"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <input
                                    type="date"
                                    placeholder="Date de naissance *"
                                    value={formData.dateOfBirth}
                                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Téléphone"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                >
                                    <option value="">Genre</option>
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Nationalité"
                                    value={formData.nationalite}
                                    onChange={e => setFormData({ ...formData, nationalite: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <select
                                    value={formData.classeId}
                                    onChange={e => setFormData({ ...formData, classeId: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                >
                                    <option value="">Sélectionner une classe</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.libelle}</option>
                                    ))}
                                </select>
                            </div>
                            <input
                                type="text"
                                placeholder="Lieu de naissance"
                                value={formData.lieuNaissace}
                                onChange={e => setFormData({ ...formData, lieuNaissace: e.target.value })}
                                style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                            <textarea
                                placeholder="Adresse"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '60px' }}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    marginTop: '16px',
                                    width: '100%',
                                    padding: '12px',
                                    background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmitting ? 'Enregistrement...' : 'Ajouter l\'étudiant'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingEtudiant && (
                <div className="modal" style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15,23,42,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '540px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        position: 'relative',
                        boxShadow: '0 20px 60px rgba(15,23,42,0.25)'
                    }}>
                        <button
                            onClick={() => { setShowEditModal(false); setEditingEtudiant(null); resetForm(); }}
                            style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                            <X size={18} color="#94a3b8" />
                        </button>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>Modifier l'étudiant</h3>
                        <div style={{ marginBottom: '16px', padding: '8px 12px', background: '#f0f9ff', borderRadius: '8px', fontSize: '13px' }}>
                            Matricule: <strong>{editingEtudiant.matricule}</strong>
                        </div>
                        <form onSubmit={handleEditStudent}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input
                                    type="text"
                                    placeholder="Prénom *"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Nom *"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <input
                                    type="email"
                                    placeholder="Email *"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <input
                                    type="password"
                                    placeholder="Nouveau mot de passe (laisser vide pour conserver)"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <input
                                    type="date"
                                    placeholder="Date de naissance *"
                                    value={formData.dateOfBirth}
                                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Téléphone"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                >
                                    <option value="">Genre</option>
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Nationalité"
                                    value={formData.nationalite}
                                    onChange={e => setFormData({ ...formData, nationalite: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Lieu de naissance"
                                value={formData.lieuNaissace}
                                onChange={e => setFormData({ ...formData, lieuNaissace: e.target.value })}
                                style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                            <textarea
                                placeholder="Adresse"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '60px' }}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    marginTop: '16px',
                                    width: '100%',
                                    padding: '12px',
                                    background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmitting ? 'Enregistrement...' : 'Mettre à jour'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQRModal && selectedEtudiant && (
                <div className="modal" style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15,23,42,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '400px',
                        position: 'relative',
                        boxShadow: '0 20px 60px rgba(15,23,42,0.25)',
                        textAlign: 'center'
                    }}>
                        <button
                            onClick={() => { setShowQRModal(false); setSelectedEtudiant(null); }}
                            style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                            <X size={18} color="#94a3b8" />
                        </button>
                        <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 700 }}>QR Code Étudiant</h3>
                        <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px' }}>
                            {selectedEtudiant.firstName} {selectedEtudiant.lastName}
                        </p>
                        <div style={{ 
                            padding: '16px', 
                            background: selectedEtudiant.qrCodeImage ? 'white' : '#f1f5f9', 
                            borderRadius: '12px',
                            display: 'inline-block',
                            marginBottom: '16px'
                        }}>
                            {selectedEtudiant.qrCodeImage ? (
                                <img 
                                    src={selectedEtudiant.qrCodeImage} 
                                    alt="QR Code" 
                                    style={{ width: '200px', height: '200px' }}
                                />
                            ) : (
                                <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                    QR Code non disponible
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: '8px', marginBottom: '16px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Matricule</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e40af' }}>{selectedEtudiant.matricule}</div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            Token: {selectedEtudiant.qrToken}
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="modal" style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15,23,42,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '450px',
                        position: 'relative',
                        boxShadow: '0 20px 60px rgba(15,23,42,0.25)'
                    }}>
                        <button
                            onClick={() => setShowImportModal(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                            <X size={18} color="#94a3b8" />
                        </button>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>Importer des étudiants</h3>
                        <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px' }}>
                            Importer des étudiants depuis un fichier Excel (.xlsx)
                        </p>
                        <div style={{ 
                            border: '2px dashed #cbd5e1', 
                            borderRadius: '12px', 
                            padding: '32px',
                            textAlign: 'center',
                            marginBottom: '16px'
                        }}>
                            <FileSpreadsheet size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
                            <p style={{ margin: '0 0 8px', color: '#475569' }}>Glissez un fichier ici</p>
                            <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '12px' }}>ou</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".xlsx,.xls"
                                onChange={handleFileImport}
                                disabled={importingFile}
                                style={{ display: 'none' }}
                                id="file-import"
                            />
                            <label
                                htmlFor="file-import"
                                style={{
                                    display: 'inline-block',
                                    padding: '10px 20px',
                                    background: importingFile ? '#94a3b8' : 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: '500',
                                    cursor: importingFile ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {importingFile ? 'Importation en cours...' : 'Sélectionner un fichier'}
                            </label>
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                            Le matricule sera généré automatiquement si non fourni
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedEtudiant && !showQRModal && !showEditModal && !showAddModal && !showImportModal && (
                <div className="modal" style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15,23,42,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '500px',
                        position: 'relative',
                        boxShadow: '0 20px 60px rgba(15,23,42,0.25)'
                    }}>
                        <button
                            onClick={() => setSelectedEtudiant(null)}
                            style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                            <X size={18} color="#94a3b8" />
                        </button>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>Détails de l'étudiant</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b' }}>Matricule</span>
                                <span style={{ fontWeight: '600' }}>{selectedEtudiant.matricule}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b' }}>Nom complet</span>
                                <span style={{ fontWeight: '600' }}>{selectedEtudiant.firstName} {selectedEtudiant.lastName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b' }}>Email</span>
                                <span>{selectedEtudiant.email ?? '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b' }}>Téléphone</span>
                                <span>{selectedEtudiant.phone ?? '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b' }}>Date de naissance</span>
                                <span>{selectedEtudiant.dateOfBirth ?? '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b' }}>Genre</span>
                                <span>{selectedEtudiant.gender === 'M' ? 'Masculin' : selectedEtudiant.gender === 'F' ? 'Féminin' : '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b' }}>Classe</span>
                                <span>{selectedEtudiant.classe ?? '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b' }}>Année d'inscription</span>
                                <span>{selectedEtudiant.anneeInscription ?? '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b' }}>Nationalité</span>
                                <span>{selectedEtudiant.nationalite ?? '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <span style={{ color: '#64748b' }}>Adresse</span>
                                <span>{selectedEtudiant.address ?? '—'}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => openQRModal(selectedEtudiant)}
                            style={{
                                marginTop: '16px',
                                width: '100%',
                                padding: '12px',
                                background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <QrCode size={16} />
                            Voir QR Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
