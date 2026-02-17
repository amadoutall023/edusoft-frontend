'use client';

import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';

interface HeaderProps {
    onMenuClick?: () => void;
    isSidebarOpen?: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
    const { user } = useAuth();

    const userName = user ? `${user.prenom} ${user.nom}` : '';
    const userRole = user ? user.role : '';
    return (
        <header className="header" style={{
            background: 'rgba(255,255,255,0.98)',
            padding: '20px 40px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            zIndex: 5,
            backdropFilter: 'blur(20px)',
            position: 'fixed',
            top: 0,
            left: '280px',
            right: 0,
            transition: 'left 0.3s ease'
        }}>
            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                className="mobile-menu-btn"
                style={{
                    display: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                }}
            >
                <Menu size={24} color="#4a5568" />
            </button>

            {/* Academic Year Selector */}
            <div className="year-selector" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
            }}>
                <label style={{
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#4a5568',
                    whiteSpace: 'nowrap'
                }}>Année scolaire :</label>
                <select style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#2d3748',
                    background: 'white',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '150px',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                }}
                    onFocus={(e: any) => e.currentTarget.style.borderColor = '#5B8DEF'}
                    onBlur={(e: any) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                    <option>2025-2026</option>
                    <option>2024-2025</option>
                    <option>2023-2024</option>
                </select>
            </div>

            {/* Right Side - Notifications & Profile */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                {/* Notification Bell */}
                <div style={{
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '10px',
                    transition: 'all 0.2s ease'
                }}
                    onMouseEnter={(e: any) => e.currentTarget.style.background = '#f7fafc'}
                    onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                >
                    <Bell size={22} color="#4a5568" strokeWidth={2} />
                    <div style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '8px',
                        height: '8px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        border: '2px solid white'
                    }} />
                </div>

                {/* Profile */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '6px 12px 6px 6px',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease'
                }}
                    onMouseEnter={(e: any) => e.currentTarget.style.background = '#f7fafc'}
                    onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                >
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #5B8DEF, #4169B8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '16px',
                        border: '2px solid #e2e8f0',
                        flexShrink: 0
                    }}>
                        {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="profile-info" style={{
                        textAlign: 'left'
                    }}>
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#2d3748'
                        }}>{userName}</div>
                        <div style={{
                            fontSize: '13px',
                            color: '#718096'
                        }}>{userRole}</div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 1024px) {
                    .header {
                        left: 0 !important;
                        padding: 16px 20px !important;
                    }
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                }
                @media (max-width: 768px) {
                    .year-selector {
                        display: none !important;
                    }
                    .profile-info {
                        display: none !important;
                    }
                }
            `}</style>
        </header>
    );
}

