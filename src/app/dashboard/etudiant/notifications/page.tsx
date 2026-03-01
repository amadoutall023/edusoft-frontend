'use client';

import React, { useState } from 'react';
import { Bell, AlertCircle, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    type: 'info' | 'warning' | 'success' | 'alert';
    title: string;
    message: string;
    date: string;
    lue: boolean;
}

// Mock notifications
const notifications: Notification[] = [
    {
        id: '1',
        type: 'info',
        title: 'Nouvel examen prévu',
        message: 'Un examen de Java est prévu le 15 Mars 2024. Préparez-vous bien.',
        date: '2024-02-28 10:30',
        lue: false
    },
    {
        id: '2',
        type: 'warning',
        title: 'Absence non justifiée',
        message: 'Votre absence au cours d\'Algorithmique du 20 Février n\'est pas justifiée.',
        date: '2024-02-27 14:20',
        lue: false
    },
    {
        id: '3',
        type: 'success',
        title: 'Note disponible',
        message: 'Votre note du devoir de Base de données est maintenant disponible (16/20).',
        date: '2024-02-26 09:15',
        lue: true
    },
    {
        id: '4',
        type: 'info',
        title: 'Changement d\'emploi du temps',
        message: 'Le cours de Java du Mardi 14h est déplacé au Mercredi 10h.',
        date: '2024-02-25 16:45',
        lue: true
    },
    {
        id: '5',
        type: 'alert',
        title: 'Rappel absence',
        message: 'Vous avez 3 heures d\'absence non justifiées ce mois-ci.',
        date: '2024-02-24 11:00',
        lue: true
    }
];

export default function EtudiantNotificationsPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [notificationsList, setNotificationsList] = useState(notifications);

    const filteredNotifications = notificationsList.filter(n => {
        if (filter === 'unread') return !n.lue;
        return true;
    });

    const unreadCount = notificationsList.filter(n => !n.lue).length;

    const markAsRead = (id: string) => {
        setNotificationsList(prev =>
            prev.map(n => n.id === id ? { ...n, lue: true } : n)
        );
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'info': return <Bell className="w-5 h-5" />;
            case 'warning': return <AlertCircle className="w-5 h-5" />;
            case 'success': return <CheckCircle className="w-5 h-5" />;
            case 'alert': return <Clock className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const getColors = (type: string) => {
        switch (type) {
            case 'info': return 'bg-[#5B8DEF]/10 text-[#5B8DEF]';
            case 'warning': return 'bg-[#f59e0b]/10 text-[#f59e0b]';
            case 'success': return 'bg-[#10b981]/10 text-[#10b981]';
            case 'alert': return 'bg-red-100 text-red-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Bouton retour */}
            <button
                onClick={() => router.push('/dashboard/etudiant')}
                className="flex items-center gap-2 text-slate-600 hover:text-[#5B8DEF] transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour au dashboard</span>
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#5B8DEF] to-[#4169B8] rounded-xl md:rounded-[20px] p-6 md:p-8 text-white shadow-lg">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Notifications
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                    {unreadCount} notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                <div className="flex gap-3">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${filter === 'all'
                            ? 'bg-[#5B8DEF] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Toutes
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${filter === 'unread'
                            ? 'bg-[#5B8DEF] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Non lues ({unreadCount})
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl md:rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 divide-y divide-slate-100">
                {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Aucune notification</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-4 cursor-pointer hover:bg-slate-50 transition-all ${!notification.lue ? 'bg-[#5B8DEF]/5' : ''
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getColors(notification.type)}`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className={`font-semibold ${!notification.lue ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {notification.title}
                                        </h3>
                                        {!notification.lue && (
                                            <span className="w-2 h-2 rounded-full bg-[#5B8DEF] shrink-0 mt-2" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                                        <Clock className="w-3 h-3" />
                                        {notification.date}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
