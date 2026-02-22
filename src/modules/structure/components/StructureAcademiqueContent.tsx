'use client';

import React, { useCallback, useMemo } from 'react';
import ClassesTable from './ClassesTable';
import NiveauxTable from './NiveauxTable';
import FilieresTable from './FilieresTable';
import ModulesTable from './ModulesTable';
import SallesTable from './SallesTable';
import { ClasseData, FiliereData, ModuleData, NiveauData, SalleData } from '@/modules/structure/types';
import { structureTabs } from '@/shared/config/structureTabs';
import { ClasseResponseDto, FiliereResponseDto, ModuleResponseDto } from '@/shared/api/types';
import { useStructureData } from '../hooks/useStructureData';
import { useAuth } from '@/modules/auth/context/AuthContext';

const toClasseData = (classe: ClasseResponseDto): ClasseData => ({
    id: classe.id,
    libelle: classe.libelle,
    filiereId: classe.filiere?.id ?? '',
    niveauId: classe.niveau?.id ?? '',
    schoolId: classe.school?.id ?? '',
    filiereLabel: classe.filiere?.libelle ?? 'Non défini',
    niveauLabel: classe.niveau?.libelle ?? 'Non défini',
    schoolLabel: classe.school?.nom ?? 'Non défini'
});

const toFiliereData = (filiere: FiliereResponseDto): FiliereData => ({
    id: filiere.id,
    nom: filiere.libelle,
    code: filiere.libelle.slice(0, 3).toUpperCase(),
    description: (filiere.modules ?? []).map(module => module.libelle).join(', ') || 'Non renseigné'
});

const toModuleData = (module: ModuleResponseDto): ModuleData => ({
    id: module.id,
    nom: module.libelle,
    code: module.libelle.slice(0, 3).toUpperCase(),
    filiereId: module.filiere?.id ?? '',
    filiereLabel: module.filiere?.libelle ?? 'Indéfini',
    credits: module.cours?.length ?? 0,
    classeId: (module.cours ?? []).map(c => c.libelle).join(', ')
});

export default function StructureAcademiqueContent() {
    const [activeTab, setActiveTab] = React.useState('classes');
    const { user } = useAuth();
    const structure = useStructureData(activeTab);

    const classes = useMemo<ClasseData[]>(() => structure.classes.map(toClasseData), [structure.classes]);
    const filieres = useMemo<FiliereData[]>(() => structure.filieres.map(toFiliereData), [structure.filieres]);
    const modules = useMemo<ModuleData[]>(() => structure.modules.map(toModuleData), [structure.modules]);
    const niveaux = useMemo<NiveauData[]>(() => structure.niveaux.map(n => ({ id: n.id, libelle: n.libelle })), [structure.niveaux]);
    const salles = useMemo<SalleData[]>(() => structure.salles.map(s => ({ id: s.id, nom: s.libelle, capacite: s.capacity ?? 0 })), [structure.salles]);

    const defaultSchoolId = user?.schoolId ?? structure.classes[0]?.school?.id ?? null;

    const handleClassesPageChange = useCallback(
        (page: number) => structure.setQuery.classes(prev => ({ ...prev, page: page - 1 })),
        [structure.setQuery.classes]
    );
    const handleClassesSearchChange = useCallback(
        (q: string) => structure.setQuery.classes(prev => ({ ...prev, q, page: 0 })),
        [structure.setQuery.classes]
    );

    const handleNiveauxPageChange = useCallback(
        (page: number) => structure.setQuery.niveaux(prev => ({ ...prev, page: page - 1 })),
        [structure.setQuery.niveaux]
    );
    const handleNiveauxSearchChange = useCallback(
        (q: string) => structure.setQuery.niveaux(prev => ({ ...prev, q, page: 0 })),
        [structure.setQuery.niveaux]
    );

    const handleFilieresPageChange = useCallback(
        (page: number) => structure.setQuery.filieres(prev => ({ ...prev, page: page - 1 })),
        [structure.setQuery.filieres]
    );
    const handleFilieresSearchChange = useCallback(
        (q: string) => structure.setQuery.filieres(prev => ({ ...prev, q, page: 0 })),
        [structure.setQuery.filieres]
    );

    const handleModulesPageChange = useCallback(
        (page: number) => structure.setQuery.modules(prev => ({ ...prev, page: page - 1 })),
        [structure.setQuery.modules]
    );
    const handleModulesSearchChange = useCallback(
        (q: string) => structure.setQuery.modules(prev => ({ ...prev, q, page: 0 })),
        [structure.setQuery.modules]
    );
    const handleModulesFiliereFilterChange = useCallback(
        (filiereId: string) => {
            structure.setQuery.modules(prev => ({
                ...prev,
                filiereId: filiereId || undefined,
                page: 0
            }));
        },
        [structure.setQuery.modules]
    );

    const handleSallesPageChange = useCallback(
        (page: number) => structure.setQuery.salles(prev => ({ ...prev, page: page - 1 })),
        [structure.setQuery.salles]
    );
    const handleSallesSearchChange = useCallback(
        (q: string) => structure.setQuery.salles(prev => ({ ...prev, q, page: 0 })),
        [structure.setQuery.salles]
    );

    return (
        <>
            <div className="page-title" style={{
                padding: '32px 40px 24px',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a202c',
                    margin: 0,
                    letterSpacing: '-0.5px'
                }}>Structure académique</h1>
            </div>

            <div className="tabs-nav" style={{
                padding: '0 40px',
                borderBottom: '2px solid #f7fafc',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto'
            }}>
                {structureTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '16px 24px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '3px solid #5B8DEF' : '3px solid transparent',
                                color: activeTab === tab.id ? '#5B8DEF' : '#718096',
                                fontSize: '15px',
                                fontWeight: activeTab === tab.id ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontFamily: 'inherit',
                                position: 'relative',
                                marginBottom: '-2px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Icon size={18} strokeWidth={2.5} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {structure.isLoading && (
                <div style={{ padding: '32px 40px', color: '#64748b' }}>
                    Chargement des données...
                </div>
            )}

            {structure.error && !structure.isLoading && (
                <div style={{ padding: '32px 40px', color: '#dc2626' }}>
                    {structure.error}
                </div>
            )}

            {!structure.isLoading && !structure.error && (
                <>
                    {activeTab === 'classes' && (
                        <ClassesTable
                            data={classes}
                            niveauxData={niveaux}
                            filiereOptions={structure.options.filieres}
                            currentPage={(structure.query.classes.page ?? 0) + 1}
                            totalPages={structure.meta.classes?.totalPages ?? 1}
                            searchTerm={structure.query.classes.q ?? ''}
                            onPageChange={handleClassesPageChange}
                            onSearchChange={handleClassesSearchChange}
                            defaultSchoolId={defaultSchoolId}
                            onCreate={structure.actions.createClasse}
                            onUpdate={structure.actions.updateClasse}
                            onDelete={structure.actions.deleteClasse}
                        />
                    )}
                    {activeTab === 'niveaux' && (
                        <NiveauxTable
                            data={niveaux}
                            currentPage={(structure.query.niveaux.page ?? 0) + 1}
                            totalPages={structure.meta.niveaux?.totalPages ?? 1}
                            searchTerm={structure.query.niveaux.q ?? ''}
                            onPageChange={handleNiveauxPageChange}
                            onSearchChange={handleNiveauxSearchChange}
                            onCreate={structure.actions.createNiveau}
                            onUpdate={structure.actions.updateNiveau}
                            onDelete={structure.actions.deleteNiveau}
                        />
                    )}
                    {activeTab === 'filieres' && (
                        <FilieresTable
                            data={filieres}
                            currentPage={(structure.query.filieres.page ?? 0) + 1}
                            totalPages={structure.meta.filieres?.totalPages ?? 1}
                            searchTerm={structure.query.filieres.q ?? ''}
                            onPageChange={handleFilieresPageChange}
                            onSearchChange={handleFilieresSearchChange}
                            onCreate={structure.actions.createFiliere}
                            onUpdate={structure.actions.updateFiliere}
                            onDelete={structure.actions.deleteFiliere}
                        />
                    )}
                    {activeTab === 'modules' && (
                        <ModulesTable
                            data={modules}
                            filiereOptions={structure.options.filieres}
                            currentPage={(structure.query.modules.page ?? 0) + 1}
                            totalPages={structure.meta.modules?.totalPages ?? 1}
                            searchTerm={structure.query.modules.q ?? ''}
                            selectedFiliereId={structure.query.modules.filiereId ?? ''}
                            onPageChange={handleModulesPageChange}
                            onSearchChange={handleModulesSearchChange}
                            onFiliereFilterChange={handleModulesFiliereFilterChange}
                            onCreate={structure.actions.createModule}
                            onUpdate={structure.actions.updateModule}
                            onDelete={structure.actions.deleteModule}
                        />
                    )}
                    {activeTab === 'salles' && (
                        <SallesTable
                            data={salles}
                            currentPage={(structure.query.salles.page ?? 0) + 1}
                            totalPages={structure.meta.salles?.totalPages ?? 1}
                            searchTerm={structure.query.salles.q ?? ''}
                            onPageChange={handleSallesPageChange}
                            onSearchChange={handleSallesSearchChange}
                            onCreate={structure.actions.createSalle}
                            onUpdate={structure.actions.updateSalle}
                            onDelete={structure.actions.deleteSalle}
                        />
                    )}
                </>
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    .page-title {
                        padding: 20px !important;
                    }
                    .page-title h1 {
                        font-size: 22px !important;
                    }
                    .tabs-nav {
                        padding: 0 20px !important;
                    }
                }
            `}</style>
        </>
    );
}
