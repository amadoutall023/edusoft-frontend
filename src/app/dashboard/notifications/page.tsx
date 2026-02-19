'use client';

import React, { useState } from 'react';
import {
    notificationsData,
    getUnreadCount,
    getNotificationIcon,
    formatTimestamp
} from '@/shared/data/notifications';
import { Notification } from '@/modules/auth/types';
import { Bell, CheckCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = getUnreadCount(notifications);

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

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

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            padding: '16px'
        }}>
            {/* Header */}
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                marginBottom: '24px'
            }}>
                <Link
                    href="/dashboard"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#5B8DEF',
                        textDecoration: 'none',
                        fontSize: '14px',
                        marginBottom: '16px'
                    }}
                >
                    <ArrowLeft size={16} />
                    Retour au dashboard
                </Link>

                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <Bell size={28} color="#5B8DEF" />
                            <h1 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#1a202c',
                                margin: 0
                            }}>
                                Notifications
                            </h1>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: '#ef4444',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    padding: '4px 12px',
                                    borderRadius: '12px'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: '#eff6ff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '10px 16px',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    color: '#5B8DEF',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <CheckCheck size={18} />
                                <span style={{ display: 'inline' }}>Tout lire</span>
                            </button>
                        )}
                    </div>

                    {/* Filter */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '20px',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                background: filter === 'all' ? '#5B8DEF' : '#f1f5f9',
                                color: filter === 'all' ? 'white' : '#64748b',
                                transition: 'all 0.2s'
                            }}
                        >
                            Toutes
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                background: filter === 'unread' ? '#5B8DEF' : '#f1f5f9',
                                color: filter === 'unread' ? 'white' : '#64748b',
                                transition: 'all 0.2s'
                            }}
                        >
                            Non lues ({unreadCount})
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                    }}>
                        {filteredNotifications.length === 0 ? (
                            <div style={{
                                padding: '40px',
                                textAlign: 'center',
                                color: '#94a3b8'
                            }}>
                                <Bell size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p>Aucune notification</p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        background: notification.isRead ? 'white' : '#f8fafc',
                                        border: selectedNotification?.id === notification.id ? '2px solid #5B8DEF' : '2px solid transparent',
                                        transition: 'all 0.2s',
                                        flexDirection: 'row'
                                    }}
                                    onMouseEnter={(e: any) => {
                                        e.currentTarget.style.background = '#f1f5f9';
                                    }}
                                    onMouseLeave={(e: any) => {
                                        e.currentTarget.style.background = notification.isRead ? 'white' : '#f8fafc';
                                    }}
                                >
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '10px',
                                        background: notification.isRead ? '#f1f5f9' : '#eff6ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
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
                                            marginBottom: '4px',
                                            flexWrap: 'wrap',
                                            gap: '4px'
                                        }}>
                                            <span style={{
                                                fontSize: '13px',
                                                color: '#5B8DEF',
                                                fontWeight: '500'
                                            }}>
                                                {getTypeLabel(notification.type)}
                                            </span>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#94a3b8',
                                                flexShrink: 0
                                            }}>
                                                {formatTimestamp(notification.timestamp)}
                                            </span>
                                        </div>
                                        <h3 style={{
                                            fontSize: '15px',
                                            fontWeight: notification.isRead ? '500' : '600',
                                            color: '#1a202c',
                                            margin: '0 0 6px 0'
                                        }}>
                                            {notification.title}
                                        </h3>
                                        <p style={{
                                            fontSize: '13px',
                                            color: '#64748b',
                                            margin: 0,
                                            lineHeight: '1.4'
                                        }}>
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 480px) {
                    div[style*="minHeight"] {
                        padding: 12px !important;
                    }
                    div[style*="borderRadius: 16px"] {
                        padding: 16px !important;
                    }
                    h1[style*="fontSize: 24px"] {
                        font-size: 20px !important;
                    }
                    div[style*="gap: 12px"] button span {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}

