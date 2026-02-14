'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, LayoutGrid, Book, Users, UserCheck, Calendar, Settings, LogOut, Building2 } from 'lucide-react';

interface SidebarProps {
    activeItem?: string;
}

export default function Sidebar({ activeItem }: SidebarProps) {
    const menuItems = [
        { icon: LayoutGrid, label: 'Tableau de bord', path: '/dashboard' },
        { icon: Book, label: 'Cours', path: '/dashboard/cours' },
        { icon: Users, label: 'Élèves', path: '/eleves' },
        { icon: UserCheck, label: 'Professeurs', path: '/dashboard/prof' },
        { icon: Users, label: 'Administration', path: '/dashboard/administration' },
        { icon: Calendar, label: 'Planning', path: '/planning' },
        { icon: Building2, label: 'Structure académique', path: '/dashboard/structure' },
        { icon: Settings, label: 'Paramètre', path: '/parametre' },
    ];

    return (
        <aside style={{
            width: '280px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'linear-gradient(180deg, #5B8DEF 0%, #4169B8 100%)',
            boxShadow: '4px 0 30px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10
        }}>
            {/* Logo Section */}
            <div style={{
                padding: '28px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.12)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            left: '-10px',
                            right: '-10px',
                            bottom: '-10px',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
                            borderRadius: '20px'
                        }} />
                        <GraduationCap size={34} color="white" strokeWidth={2.5} style={{ position: 'relative', zIndex: 1 }} />
                    </div>
                    <div>
                        <div style={{
                            fontSize: '26px',
                            fontWeight: '800',
                            color: 'white',
                            letterSpacing: '0.5px',
                            textShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>SOFTEDU</div>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav style={{
                flex: 1,
                padding: '20px 14px',
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = item.label === activeItem;

                    return (
                        <Link
                            href={item.path}
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '13px 16px',
                                marginBottom: '4px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                background: isActive
                                    ? 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))'
                                    : 'transparent',
                                color: 'white',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '15px',
                                fontWeight: isActive ? '600' : '500',
                                border: isActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                                backdropFilter: isActive ? 'blur(10px)' : 'none',
                                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                transform: 'translateX(0)',
                                textDecoration: 'none',
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }
                            }}
                        >
                            <Icon size={20} strokeWidth={2.3} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Déconnexion */}
            <div style={{
                padding: '20px',
                borderTop: '1px solid rgba(255,255,255,0.12)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255,255,255,0.08)'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    }}>
                    <LogOut size={20} strokeWidth={2.3} />
                    <span>Déconnexion</span>
                </div>
            </div>
        </aside>
    );
}

