'use client';

import React, { useState } from 'react';
import Sidebar from '@/shared/components/Sidebar';
import Header from '@/shared/components/Header';
import TableAdmin from './TableAdmin';
import { membresAdministrationData } from '../data/membres';

export default function AdministrationContent() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            <Sidebar activeItem="Administration" />

            {/* Main Content Area */}
            <main className="main-content" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                marginLeft: '280px',
                paddingTop: '80px',
                transition: 'margin-left 0.3s ease'
            }}>
                {/* Header */}
                <Header
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    isSidebarOpen={isSidebarOpen}
                />

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
                        }}>Membres de l'administration</h1>
                    </div>

                    {/* Table */}
                    <TableAdmin data={membresAdministrationData} />
                </div>
            </main>

            <style jsx>{`
                @media (max-width: 1024px) {
                    .main-content {
                        margin-left: 0 !important;
                    }
                }
                @media (max-width: 768px) {
                    .page-title {
                        padding: 20px !important;
                    }
                    .page-title h1 {
                        font-size: 22px !important;
                    }
                }
            `}</style>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap');
        
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

