'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Notification } from '@/modules/auth/types';
import {
    getUnreadCount,
    getNotificationIcon,
    formatTimestamp
} from '@/shared/data/notifications';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/shared/hooks/useNotifications';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const router = useRouter();
    const { notifications, isLoading, error, setNotifications, refresh } = useNotifications();
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    const unreadCount = getUnreadCount(notifications);

    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    // Styles pour mobile
    const dropdownStyle: React.CSSProperties = isMobile ? {
        position: 'fixed',
        top: '60px',
        left: '0',
        right: '0',
        width: '100%',
        maxWidth: '100%',
        maxHeight: 'calc(100vh - 60px)',
        backgroundColor: 'white',
        borderRadius: '0 0 16px 16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        zIndex: 999999999,
        display: 'flex',
        flexDirection: 'column'
    } : {
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '8px',
        width: '380px',
        maxWidth: '380px',
        maxHeight: '500px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        zIndex: 999999999,
        display: 'flex',
        flexDirection: 'column'
    };

    const overlayStyle: React.CSSProperties = isMobile ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999999998
    } : {
        display: 'none'
    };

    return (
        <>
            {/* Mobile overlay */}
            <div
                className="notification-overlay"
                style={overlayStyle}
                onClick={onClose}
            />

            <div
                ref={dropdownRef}
                className="notification-dropdown"
                style={dropdownStyle}
            >
                {/* Header */}
                <div className="p-4 lg:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    {selectedNotification ? (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="p-1 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <div>
                                <div className="text-[15px] font-semibold text-slate-900">Détails</div>
                                <div className="text-xs text-slate-500">Notification #{selectedNotification.id}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <Bell size={20} className="text-[#5B8DEF]" />
                            <span className="text-base font-semibold text-slate-900">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    )}

                    {!selectedNotification && unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#5B8DEF] text-sm hover:bg-slate-200 transition-colors"
                        >
                            <CheckCheck size={16} />
                            Tout marquer comme lu
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto max-h-[400px]">
                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500 text-sm">
                            Chargement des notifications...
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center text-slate-500 text-sm flex flex-col gap-2">
                            <span>{error}</span>
                            <button
                                onClick={() => void refresh()}
                                className="text-[#5B8DEF] text-sm font-semibold"
                            >
                                Réessayer
                            </button>
                        </div>
                    ) : selectedNotification ? (
                        <div className="p-5">
                            <div className="flex items-start gap-4 mb-5">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${selectedNotification.isRead ? 'bg-slate-100' : 'bg-blue-50'}`}>
                                    {getNotificationIcon(selectedNotification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-[#5B8DEF] font-medium mb-1">
                                        {getTypeLabel(selectedNotification.type)}
                                    </div>
                                    <div className="text-base font-semibold text-slate-900">
                                        {selectedNotification.title}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                <p className="text-sm text-slate-600 leading-relaxed m-0">
                                    {selectedNotification.message}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    {formatTimestamp(selectedNotification.timestamp)}
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedNotification.isRead ? (
                                        <span className="text-xs text-emerald-500 flex items-center gap-1">
                                            <Check size={14} />
                                            Lu
                                        </span>
                                    ) : (
                                        <span className="text-xs text-[#5B8DEF] flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-[#5B8DEF]" />
                                            Non lu
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <Bell size={40} className="text-slate-300 mb-3 mx-auto" />
                                <p className="text-slate-500 text-sm">Aucune notification</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-3.5 border-b border-slate-100 cursor-pointer flex items-start gap-3.5 transition-colors hover:bg-slate-50 ${notification.isRead ? 'bg-white' : 'bg-slate-50'}`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg relative ${notification.isRead ? 'bg-slate-100' : 'bg-blue-50'}`}>
                                        {getNotificationIcon(notification.type)}
                                        {!notification.isRead && (
                                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#5B8DEF] border-2 border-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm ${notification.isRead ? 'font-medium' : 'font-semibold'} text-slate-900`}>
                                                {notification.title}
                                            </span>
                                            <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                                                {formatTimestamp(notification.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 m-0 truncate">
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
                    <div className="p-3 border-t border-slate-200 text-center bg-slate-50">
                        <button
                            onClick={() => {
                                onClose();
                                router.push('/dashboard/notifications');
                            }}
                            className="bg-none border-none text-[#5B8DEF] text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Voir toutes les notifications
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
