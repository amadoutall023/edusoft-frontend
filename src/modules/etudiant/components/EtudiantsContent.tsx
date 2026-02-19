'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Upload, Eye, X, Trash2, Edit2, FileSpreadsheet } from 'lucide-react';
import SearchInput from '@/shared/components/SearchInput';
import Pagination from '@/shared/components/Pagination';
import { Etudiant } from '../types';
import { etudiantsData, classes } from '../data/etudiants';

export default function EtudiantsContent() {
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

    const itemsPerPage = 5;

    // Generate unique values for filters
    const uniqueClasses = useMemo(() =>
        [...new Set(etudiantsData.map(item => item.classe))].sort(),
        []
    );

    const uniqueAnnees = useMemo(() =>
        [...new Set(etudiantsData.map(item => item.anneeInscription))].sort((a, b) => b - a),
        []
    );

    // Filter data based on search term and filters
    const filteredData = etudiantsData.filter(item => {
        const matchesSearch =
            item.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.phone.includes(searchTerm);

        const matchesClasse = !filters.classe || item.classe === filters.classe;
        const matchesAnnee = !filters.anneeInscription || item.anneeInscription === parseInt(filters.anneeInscription);
        const matchesGender = !filters.gender || item.gender === filters.gender;

        return matchesSearch && matchesClasse && matchesAnnee && matchesGender;
    });

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    // Paginate data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
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
        // Placeholder for Excel import functionality
        alert('Fonctionnalité d\'importation Excel à implémenter');
    };

    const handleDeleteEtudiant = (id: number) => {
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
            {/* Page Title */}
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

            {/* Search and Filter Section */}
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

            {/* Filter Panel */}
            {showFilters && (
                <div style={{
                    padding: '12px 24px',
                    background: '#f0f7ff',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#4a5568' }}>Classe</label>
                        <select
                            value={filters.classe}
                            onChange={(e) => handleFilterChange('classe', e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1.5px solid #e5e7eb',
                                background: 'white',
                                fontSize: '13px',
                                color: '#2d3748',
                                minWidth: '160px',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="">Toutes les classes</option>
                            {uniqueClasses.map(classe => (
                                <option key={classe} value={classe}>{classe}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Année</label>
                        <select
                            value={filters.anneeInscription}
                            onChange={(e) => handleFilterChange('anneeInscription', e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1.5px solid #e5e7eb',
                                background: 'white',
                                fontSize: '13px',
                                color: '#2d3748',
                                minWidth: '160px',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="">Toutes les années</option>
                            {uniqueAnnees.map(annee => (
                                <option key={annee} value={annee}>{annee}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Genre</label>
                        <select
                            value={filters.gender}
                            onChange={(e) => handleFilterChange('gender', e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1.5px solid #e5e7eb',
                                background: 'white',
                                fontSize: '13px',
                                color: '#2d3748',
                                minWidth: '160px',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
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
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                background: 'transparent',
                                border: '1.5px solid #e53e3e',
                                borderRadius: '8px',
                                color: '#e53e3e',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                marginTop: '14px',
                                fontFamily: 'inherit'
                            }}
                        >
                            <X size={16} />
                            <span>Effacer</span>
                        </button>
                    )}

                    <div style={{
                        marginLeft: 'auto',
                        fontSize: '14px',
                        color: '#4a5568',
                        fontWeight: '500'
                    }}>
                        {filteredData.length} résultat{filteredData.length !== 1 ? 's' : ''}
                    </div>
                </div>
            )}

            {/* Table Container - Scrollable */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '0 24px'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '1000px'
                }}>
                    <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 100%)' }}>
                            <th style={{ padding: '10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '12px', width: '40px' }}>N°</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '12px', width: '90px' }}>Matricule</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '12px', width: '80px' }}>Prénom</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '12px', width: '80px' }}>Nom</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '12px', width: '140px' }}>Email</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '12px', width: '100px' }}>Téléphone</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '12px', width: '70px' }}>Classe</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '12px', width: '50px' }}>Année</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '12px', width: '80px' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((etudiant, index) => (
                                <tr key={etudiant.id} style={{
                                    background: index % 2 === 0 ? 'white' : '#fafbfc',
                                    transition: 'all 0.2s ease'
                                }}
                                    onMouseEnter={(e: any) => {
                                        e.currentTarget.style.background = '#f0f7ff';
                                    }}
                                    onMouseLeave={(e: any) => {
                                        e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafbfc';
                                    }}
                                >
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#4a5568', fontSize: '12px', fontWeight: '500', borderBottom: '1px solid #f1f5f9' }}>{startIndex + index + 1}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#5B8DEF', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>{etudiant.matricule}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#2d3748', fontSize: '12px', fontWeight: '500', borderBottom: '1px solid #f1f5f9' }}>{etudiant.firstName}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#2d3748', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase' }}>{etudiant.lastName}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#4a5568', fontSize: '11px', borderBottom: '1px solid #f1f5f9' }}>{etudiant.email}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#4a5568', fontSize: '12px', borderBottom: '1px solid #f1f5f9' }}>{etudiant.phone}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#22c55e', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>{etudiant.classe}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#4a5568', fontSize: '12px', borderBottom: '1px solid #f1f5f9' }}>{etudiant.anneeInscription}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => setSelectedEtudiant(etudiant)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: '#E3F2FD',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <Eye size={14} color="#5B8DEF" />
                                            </button>
                                            <button
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: '#FEF3C7',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <Edit2 size={14} color="#D97706" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEtudiant(etudiant.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: '#FEE2E2',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <Trash2 size={14} color="#DC2626" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#4a5568', fontSize: '15px' }}>
                                    Aucun étudiant ne correspond aux critères de recherche
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Add Student Modal */}
            {showAddModal && (
                <AddEtudiantModal onClose={() => setShowAddModal(false)} />
            )}

            {/* Student Details Modal */}
            {selectedEtudiant && (
                <EtudiantDetailsModal etudiant={selectedEtudiant} onClose={() => setSelectedEtudiant(null)} />
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    div[style*="padding: 32px 40px"] {
                        padding: 20px !important;
                    }
                    div[style*="padding: 24px 40px"] {
                        padding: 16px 20px !important;
                    }
                    div[style*="padding: 20px 40px"] {
                        padding: 16px 20px !important;
                    }
                    div[style*="overflow-x: auto"] {
                        padding: 0 20px !important;
                    }
                }
            `}</style>
        </div>
    );
}

// Add Student Modal Component
function AddEtudiantModal({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        matricule: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        lieuNaissance: '',
        nationalite: '',
        address: '',
        gender: '',
        classe: '',
        anneeInscription: new Date().getFullYear()
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('New student:', formData);
        onClose();
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
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
        }}
            onClick={onClose}
        >
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '28px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                        Ajouter un étudiant
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#f1f5f9',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={18} color="#64748b" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Matricule *</label>
                            <input
                                type="text"
                                required
                                value={formData.matricule}
                                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Classe *</label>
                            <select
                                required
                                value={formData.classe}
                                onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', background: 'white', cursor: 'pointer' }}
                            >
                                <option value="">Sélectionner</option>
                                {classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Prénom *</label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Nom *</label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Téléphone *</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Date de naissance</label>
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Lieu de naissance</label>
                            <input
                                type="text"
                                value={formData.lieuNaissance}
                                onChange={(e) => setFormData({ ...formData, lieuNaissance: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Nationalité</label>
                            <input
                                type="text"
                                value={formData.nationalite}
                                onChange={(e) => setFormData({ ...formData, nationalite: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Genre</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', background: 'white', cursor: 'pointer' }}
                            >
                                <option value="">Sélectionner</option>
                                <option value="M">Masculin</option>
                                <option value="F">Féminin</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Adresse</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '10px',
                                border: '1.5px solid #e2e8f0',
                                background: 'white',
                                color: '#64748b',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '12px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Student Details Modal Component
function EtudiantDetailsModal({ etudiant, onClose }: { etudiant: Etudiant; onClose: () => void }) {
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
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
        }}
            onClick={onClose}
        >
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '28px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                        Détails de l'étudiant
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#f1f5f9',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={18} color="#64748b" />
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px',
                            fontSize: '28px',
                            fontWeight: '700',
                            color: 'white'
                        }}>
                            {etudiant.firstName[0]}{etudiant.lastName[0]}
                        </div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a202c' }}>
                            {etudiant.firstName} {etudiant.lastName}
                        </h3>
                        <p style={{ margin: '4px 0 0', color: '#5B8DEF', fontWeight: '600' }}>{etudiant.matricule}</p>
                    </div>

                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Email</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{etudiant.email}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Téléphone</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{etudiant.phone}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Date de naissance</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{etudiant.dateOfBirth || '-'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Lieu de naissance</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{etudiant.lieuNaissance || '-'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Nationalité</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{etudiant.nationalite || '-'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Genre</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{etudiant.gender === 'M' ? 'Masculin' : etudiant.gender === 'F' ? 'Féminin' : '-'}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Adresse</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{etudiant.address || '-'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Classe</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e' }}>{etudiant.classe}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Année d'inscription</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#5B8DEF' }}>{etudiant.anneeInscription}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1.5px solid #e2e8f0',
                            background: 'white',
                            color: '#475569',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontFamily: 'inherit'
                        }}
                    >
                        <Edit2 size={16} />
                        Modifier
                    </button>
                    <button
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#fee2e2',
                            color: '#dc2626',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontFamily: 'inherit'
                        }}
                    >
                        <Trash2 size={16} />
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
}

