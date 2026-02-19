'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, LayoutGrid, Book, Users, UserCheck, Calendar, Settings, LogOut, Building2, Menu, X } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useSidebar } from '@/shared/context/SidebarContext';

interface SidebarProps {
    activeItem?: string;
}

export default function Sidebar({ activeItem }: SidebarProps) {
    const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
    const { logout, user } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/connexion');
    };

    const menuItems = [
        { icon: LayoutGrid, label: 'Tableau de bord', path: '/dashboard' },
        { icon: Book, label: 'Cours', path: '/dashboard/cours' },
        { icon: Users, label: 'Élèves', path: '/eleves' },
        { icon: UserCheck, label: 'Professeurs', path: '/dashboard/prof' },
        { icon: Users, label: 'Administration', path: '/dashboard/administration' },
        { icon: Calendar, label: 'Planning', path: '/dashboard/planning' },
        { icon: Building2, label: 'Structure académique', path: '/dashboard/structure' },
        { icon: Settings, label: 'Paramètre', path: '/parametre' },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                style={{
                    display: 'none',
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    zIndex: 50,
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #5B8DEF, #4169B8)',
                    color: 'white',
                    cursor: 'pointer',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(91,141,239,0.4)'
                }}
                className="mobile-menu-btn"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    onClick={closeSidebar}
                    style={{
                        display: 'none',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 40,
                        backdropFilter: 'blur(4px)'
                    }}
                    className="mobile-overlay"
                />
            )}

            <aside
                className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
                style={{
                    width: '280px',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    background: 'linear-gradient(180deg, #5B8DEF 0%, #4169B8 100%)',
                    boxShadow: '4px 0 30px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 50,
                    transition: 'transform 0.3s ease'
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
                            overflow: 'hidden',
                            flexShrink: 0
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
                                onClick={closeSidebar}
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
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Icon size={20} strokeWidth={2.3} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Déconnexion */}
                <div style={{
                    padding: '20px',
                    borderTop: '1px solid rgba(255,255,255,0.12)'
                }}>
                    {user && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 16px',
                            marginBottom: '10px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white'
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}>
                                {user.prenom.charAt(0)}{user.nom.charAt(0)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {user.prenom} {user.nom}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    opacity: 0.8
                                }}>
                                    {user.role}
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        onClick={handleLogout}
                        style={{
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
                    >
                        <LogOut size={20} strokeWidth={2.3} />
                        <span>Déconnexion</span>
                    </div>
                </div>
            </aside>

            <style jsx>{`
                @media (min-width: 1025px) {
                    .sidebar {
                        transform: translateX(0) !important;
                    }
                    .mobile-menu-btn {
                        display: none !important;
                    }
                    .mobile-overlay {
                        display: none !important;
                    }
                }
                @media (max-width: 1024px) {
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                    .mobile-overlay {
                        display: block !important;
                    }
                    .sidebar {
                        transform: translateX(-100%);
                    }
                    .sidebar.sidebar-open {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
}
