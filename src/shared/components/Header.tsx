'use client';

import React, { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useSidebar } from '@/shared/context/SidebarContext';
import { useActiveYear } from '@/shared/context/ActiveYearContext';

const NotificationDropdown = dynamic(() => import('./NotificationDropdown'), { ssr: false });

interface HeaderProps {
    onMenuClick?: () => void;
    isSidebarOpen?: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
    const { user, roles } = useAuth();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const { toggleSidebar } = useSidebar();
    const {
        availableYears,
        selectedYearId,
        isLoading: isYearLoading,
        isSaving: isYearSaving,
        error: yearError,
        setActiveYearById
    } = useActiveYear();

    const userName = user ? `${user.firstName} ${user.lastName}` : '';
    const userRole = roles.length > 0 ? roles[0].replace('ROLE_', '').replaceAll('_', ' ') : '';

    const toggleNotifications = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };

    const handleMenuClick = () => {
        toggleSidebar();
    };

    return (
        <header className="header" style={{
            background: 'rgba(255,255,255,0.98)',
            padding: '20px 40px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            zIndex: 9999999999,
            backdropFilter: 'blur(20px)',
            position: 'fixed',
            top: 0,
            left: '280px',
            right: 0,
            transition: 'left 0.3s ease',
            height: '80px'
        }}>
            {/* Mobile Menu Button */}
            <button
                onClick={handleMenuClick}
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
                <select
                    value={selectedYearId}
                    onChange={async (e) => {
                        const value = e.target.value;
                        if (!value) return;
                        try {
                            await setActiveYearById(value);
                        } catch {
                            // Error state is handled by context
                        }
                    }}
                    disabled={isYearLoading || availableYears.length === 0}
                    style={{
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
                    {availableYears.length === 0 && (
                        <option value="">{isYearLoading ? 'Chargement...' : 'Aucune année'}</option>
                    )}
                    {availableYears.map(year => (
                        <option key={year.id} value={year.id}>{year.annee}</option>
                    ))}
                </select>
                {yearError && (
                    <span style={{ fontSize: '12px', color: '#dc2626' }}>
                        {yearError}
                    </span>
                )}
                {isYearSaving && (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Sauvegarde...</span>
                )}
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
                    transition: 'all 0.2s ease',
                    background: isNotificationOpen ? '#eff6ff' : 'transparent'
                }}
                    onClick={toggleNotifications}
                    onMouseEnter={(e: any) => {
                        if (!isNotificationOpen) e.currentTarget.style.background = '#f7fafc';
                    }}
                    onMouseLeave={(e: any) => {
                        if (!isNotificationOpen) e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Bell size={22} color={isNotificationOpen ? '#5B8DEF' : '#4a5568'} strokeWidth={2} />
                    {/* Unread notification badge */}
                    <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        minWidth: '18px',
                        height: '18px',
                        background: '#ef4444',
                        borderRadius: '9px',
                        border: '2px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: 'white',
                        padding: '0 4px'
                    }}>
                        2
                    </div>

                    {/* Notification Dropdown */}
                    <div
                        className="notification-container"
                        style={{ zIndex: 99999999 }}
                    >
                        <NotificationDropdown
                            isOpen={isNotificationOpen}
                            onClose={() => setIsNotificationOpen(false)}
                        />
                    </div>
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
                        {(userName || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
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
                        z-index: 9999999 !important;
                    }
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                }
                @media (max-width: 768px) {
                    .header {
                        z-index: 9999999 !important;
                        height: 60px !important;
                    }
                    .year-selector {
                        display: none !important;
                    }
                    .profile-info {
                        display: none !important;
                    }
                    .notification-dropdown {
                        z-index: 99999999 !important;
                        position: fixed !important;
                        top: 60px !important;
                        left: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        max-height: calc(100vh - 60px) !important;
                        border-radius: 0 0 16px 16px !important;
                    }
                    .notification-container {
                        z-index: 99999999 !important;
                    }
                }
            `}</style>
        </header>
    );
}
