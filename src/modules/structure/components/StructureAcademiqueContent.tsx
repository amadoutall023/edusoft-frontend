'use client';

import React, { useState } from 'react';
import { GraduationCap, Book, Building2, DoorOpen } from 'lucide-react';
import Sidebar from '../../../shared/components/Sidebar';
import Header from '../../../shared/components/Header';
import ClassesTable from './ClassesTable';
import FilieresTable from './FilieresTable';
import ModulesTable from './ModulesTable';
import SallesTable from './SallesTable';
import { ClasseData } from '@/modules/structure/types';
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

    return (
        <div style={{
            fontFamily: '"Outfit", "Poppins", -apple-system, sans-serif',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 50%, #3E6AB8 100%)',
            display: 'flex',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Background pattern */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                pointerEvents: 'none'
            }} />

            {/* Sidebar */}
            <Sidebar activeItem="Structure académique" />

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                marginLeft: '280px'
            }}>
                {/* Header */}
                <Header userName="M. Diaby Kande" userRole="Responsable pédagogique" />

                {/* Content Container with white background */}
                <div style={{
                    flex: 1,
                    margin: '24px',
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Page Title */}
                    <div style={{
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
                    <div style={{
                        padding: '0 40px',
                        borderBottom: '2px solid #f7fafc',
                        display: 'flex',
                        gap: '8px'
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
                                        marginBottom: '-2px'
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
                    {activeTab === 'classes' && <ClassesTable data={classesData} />}
                    {activeTab === 'filieres' && <FilieresTable data={filieresData} />}
                    {activeTab === 'modules' && <ModulesTable data={modulesData} />}
                    {activeTab === 'salles' && <SallesTable data={sallesData} />}
                </div>
            </main>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap');
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          transition: background 0.2s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
        </div>
    );
}

