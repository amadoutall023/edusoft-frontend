'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Notification } from '@/modules/auth/types';
import {
    notificationsData,
    getUnreadCount,
    getNotificationIcon,
    formatTimestamp
} from '@/shared/data/notifications';
import { Bell, X, Check, CheckCheck } from 'lucide-react';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = getUnreadCount(notifications);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);

        // Mark as read if not already
        if (!notification.isRead) {
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                )
            );
        }
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const getTypeLabel = (type: string): string => {
        switch (type) {
            case 'INSCRIPTION':
                return 'Inscription';
            case 'SESSION_ANNULEE':
                return 'Session annulée';
            case 'COURS_TERMINEE':
                return 'Cours terminé';
            case 'EMARGEMENT':
                return 'Émargement';
            case 'EVALUATION':
                return 'Évaluation';
            case 'NOTE':
                return 'Note';
            case 'NOUVELLE':
            default:
                return 'Nouvelle';
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '380px',
                maxWidth: 'calc(100vw - 40px)',
                maxHeight: '500px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideDown 0.2s ease-out'
            }}
        >
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @media (max-width: 480px) {
                    .notification-dropdown {
                        width: 320px !important;
                        right: -10px !important;
                    }
                }
            `}</style>

            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc'
            }}>
                {selectedNotification ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => setSelectedNotification(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e: any) => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a202c' }}>
                                Détails
                            </div>
                            <div style={{ fontSize: '12px', color: '#718096' }}>
                                Notification #{selectedNotification.id}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bell size={20} color="#5B8DEF" />
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <span style={{
                                background: '#ef4444',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '10px'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </div>
                )}

                {!selectedNotification && unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#5B8DEF',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e: any) => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                    >
                        <CheckCheck size={16} />
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                maxHeight: '400px'
            }}>
                {selectedNotification ? (
                    // Detail view
                    <div style={{ padding: '20px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: selectedNotification.isRead ? '#f1f5f9' : '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                flexShrink: 0
                            }}>
                                {getNotificationIcon(selectedNotification.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#5B8DEF',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                }}>
                                    {getTypeLabel(selectedNotification.type)}
                                </div>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#1a202c'
                                }}>
                                    {selectedNotification.title}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <p style={{
                                fontSize: '14px',
                                color: '#4a5568',
                                lineHeight: '1.6',
                                margin: 0
                            }}>
                                {selectedNotification.message}
                            </p>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{
                                fontSize: '13px',
                                color: '#718096'
                            }}>
                                {formatTimestamp(selectedNotification.timestamp)}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {selectedNotification.isRead ? (
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#10b981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Check size={14} />
                                        Lu
                                    </span>
                                ) : (
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#5B8DEF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <span style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: '#5B8DEF'
                                        }} />
                                        Non lu
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // List view
                    notifications.length === 0 ? (
                        <div style={{
                            padding: '40px 20px',
                            textAlign: 'center'
                        }}>
                            <Bell size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                            <p style={{ color: '#718096', fontSize: '14px' }}>
                                Aucune notification
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                    padding: '14px 20px',
                                    borderBottom: '1px solid #f1f5f9',
                                    cursor: 'pointer',
                                    background: notification.isRead ? 'white' : '#f8fafc',
                                    transition: 'background 0.2s',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '14px'
                                }}
                                onMouseEnter={(e: any) => {
                                    e.currentTarget.style.background = '#f1f5f9';
                                }}
                                onMouseLeave={(e: any) => {
                                    e.currentTarget.style.background = notification.isRead ? 'white' : '#f8fafc';
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: notification.isRead ? '#f1f5f9' : '#eff6ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    flexShrink: 0,
                                    position: 'relative'
                                }}>
                                    {getNotificationIcon(notification.type)}
                                    {!notification.isRead && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-2px',
                                            right: '-2px',
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: '#5B8DEF',
                                            border: '2px solid white'
                                        }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '4px'
                                    }}>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: notification.isRead ? '500' : '600',
                                            color: '#1a202c'
                                        }}>
                                            {notification.title}
                                        </span>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#94a3b8',
                                            flexShrink: 0,
                                            marginLeft: '8px'
                                        }}>
                                            {formatTimestamp(notification.timestamp)}
                                        </span>
                                    </div>
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#64748b',
                                        margin: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>

            {/* Footer */}
            {!selectedNotification && (
                <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid #e2e8f0',
                    textAlign: 'center',
                    background: '#f8fafc'
                }}>
                    <button
                        onClick={() => {
                            // Fermer le dropdown et naviguer vers la page des notifications
                            onClose();
                            router.push('/dashboard/notifications');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: '#5B8DEF',
                            fontWeight: '500',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e: any) => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                    >
                        Voir toutes les notifications
                    </button>
                </div>
            )}
        </div>
    );
}

