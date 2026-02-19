'use client';

import React, { useState } from 'react';
import ClassesTable from './ClassesTable';
import NiveauxTable from './NiveauxTable';
import FilieresTable from './FilieresTable';
import ModulesTable from './ModulesTable';
import SallesTable from './SallesTable';
import { ClasseData, NiveauData } from '@/modules/structure/types';
import { structureTabs } from '@/shared/config/structureTabs';
import { filieresData } from '@/modules/structure/data/filieres';
import { modulesData } from '@/modules/structure/data/modules';
import { sallesData } from '@/modules/structure/data/salles';

export default function StructureAcademiqueContent() {
    const [activeTab, setActiveTab] = useState('classes');

    const classesData: ClasseData[] = [
        { id: 1, libelle: 'Classe A1', filiereId: 'f1', niveauId: 'n1', schoolId: 's1' },
        { id: 2, libelle: 'Classe A2', filiereId: 'f1', niveauId: 'n2', schoolId: 's1' },
        { id: 3, libelle: 'Classe B1', filiereId: 'f2', niveauId: 'n1', schoolId: 's1' },
        { id: 4, libelle: 'Classe B2', filiereId: 'f2', niveauId: 'n2', schoolId: 's1' },
        { id: 5, libelle: 'Classe C1', filiereId: 'f3', niveauId: 'n3', schoolId: 's1' },
        { id: 6, libelle: 'Classe C2', filiereId: 'f3', niveauId: 'n1', schoolId: 's1' },
        { id: 7, libelle: 'Classe D1', filiereId: 'f1', niveauId: 'n4', schoolId: 's1' },
        { id: 8, libelle: 'Classe D2', filiereId: 'f2', niveauId: 'n4', schoolId: 's1' },
        { id: 9, libelle: 'Classe E1', filiereId: 'f4', niveauId: 'n5', schoolId: 's1' },
    ];

    const niveauxData: NiveauData[] = [
        { libelle: 'Première année' },
        { libelle: 'Deuxième année' },
        { libelle: 'Troisième année' },
        { libelle: 'Quatrième année' },
        { libelle: 'Cinquième année' },
    ];

    return (
        <>
            {/* Page Title */}
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

            {/* Tabs Navigation */}
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
                            onMouseEnter={(e: any) => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.color = '#5B8DEF';
                                    e.currentTarget.style.background = '#f7fafc';
                                }
                            }}
                            onMouseLeave={(e: any) => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.color = '#718096';
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <Icon size={18} strokeWidth={2.5} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content based on active tab */}
            {activeTab === 'classes' && <ClassesTable data={classesData} niveauxData={niveauxData} />}
            {activeTab === 'niveaux' && <NiveauxTable data={niveauxData} />}
            {activeTab === 'filieres' && <FilieresTable data={filieresData} />}
            {activeTab === 'modules' && <ModulesTable data={modulesData} />}
            {activeTab === 'salles' && <SallesTable data={sallesData} />}

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

