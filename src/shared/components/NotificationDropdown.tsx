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
import { Bell, Check, CheckCheck } from 'lucide-react';

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
        <>
            {/* Mobile overlay */}
            <div
                className="lg:hidden fixed inset-0 bg-black/50 z-[10000]"
                onClick={onClose}
            />

            <div
                ref={dropdownRef}
                className="notification-dropdown w-[380px] max-w-[calc(100vw-40px)] max-h-[500px] bg-white rounded-2xl shadow-xl overflow-hidden z-[10001] lg:z-[9999] flex flex-col animate-slide-down lg:absolute lg:top-full lg:right-0 lg:mt-2"
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
                    {selectedNotification ? (
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
                .animate-slide-down {
                    animation: slideDown 0.2s ease-out;
                }
                @media (max-width: 1023px) {
                    .notification-dropdown {
                        position: fixed !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        right: 0 !important;
                        left: 0 !important;
                        bottom: 0 !important;
                        top: 60px !important;
                        margin-top: 0 !important;
                        border-radius: 16px 16px 0 0 !important;
                        max-height: none !important;
                        height: calc(100vh - 60px) !important;
                    }
                }
            `}</style>
        </>
    );
}
