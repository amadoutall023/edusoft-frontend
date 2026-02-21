'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Upload, Eye, X, Trash2, Edit2, FileSpreadsheet } from 'lucide-react';
import SearchInput from '@/shared/components/SearchInput';
import Pagination from '@/shared/components/Pagination';
import { Etudiant } from '../types';
import { fetchStudents } from '../services/studentService';
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
        filiere: student.classe?.filiere?.libelle ?? null,
        niveau: student.classe?.niveau?.libelle ?? null
    },
    anneeInscription: student.anneeInscription ?? undefined,
    qrToken: student.qrToken ?? undefined
});

export default function EtudiantsContent() {
    const [students, setStudents] = useState<Etudiant[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
    const [filters, setFilters] = useState({
        classe: '',
        anneeInscription: '',
        gender: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const itemsPerPage = 5;

    useEffect(() => {
        const loadStudents = async () => {
            try {
                setIsLoading(true);
                const payload = await fetchStudents();
                setStudents(payload.map(mapStudent));
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

        loadStudents();
    }, []);

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

    const handleImportExcel = () => {
        alert('Fonctionnalité d\'importation Excel à implémenter');
    };

    const handleDeleteEtudiant = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant?')) {
            console.log('Delete student:', id);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 80px)',
            background: '#f8fafc',
            overflow: 'hidden'
        }}>
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
                        onClick={handleImportExcel}
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
                        onClick={() => setShowAddModal(true)}
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
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5f5',
                                marginTop: '6px'
                            }}
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
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5f5',
                                marginTop: '6px'
                            }}
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
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5f5',
                                marginTop: '6px'
                            }}
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

            <div style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {isLoading && (
                    <div style={{ padding: '24px', color: '#64748b' }}>
                        Chargement des étudiants...
                    </div>
                )}

                {error && !isLoading && (
                    <div style={{ padding: '24px', color: '#dc2626' }}>
                        {error}
                    </div>
                )}

                {!isLoading && !error && (
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
                                        <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: '13px' }}>{etudiant.gender ?? '—'}</td>
                                        <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
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
                                                onClick={() => console.log('Edit', etudiant.id)}
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

                {!isLoading && !error && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

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
                        position: 'relative',
                        boxShadow: '0 20px 60px rgba(15,23,42,0.25)'
                    }}>
                        <button
                            onClick={() => setShowAddModal(false)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={18} color="#94a3b8" />
                        </button>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>Ajouter un étudiant</h3>
                        <p style={{ margin: 0, color: '#64748b' }}>Fonctionnalité en cours d'intégration.</p>
                    </div>
                </div>
            )}

            {selectedEtudiant && (
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
                        maxWidth: '520px',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setSelectedEtudiant(null)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={18} color="#94a3b8" />
                        </button>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>
                            {selectedEtudiant.firstName} {selectedEtudiant.lastName}
                        </h3>
                        <p style={{ marginBottom: '8px', color: '#475569' }}>
                            {selectedEtudiant.email}
                        </p>
                        <p style={{ margin: 0, color: '#475569' }}>
                            Classe : {selectedEtudiant.classe ?? 'Non définie'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
