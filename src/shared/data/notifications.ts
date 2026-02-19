import { Notification } from '@/modules/auth/types';

export const notificationsData: Notification[] = [
    {
        id: 1,
        type: 'INSCRIPTION',
        title: 'Nouvelle inscription',
        message: 'Un nouvel étudiant s\'est inscrit en Classe de Terminale S1',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // Il y a 30 minutes
        isRead: false
    },
    {
        id: 2,
        type: 'SESSION_ANNULEE',
        title: 'Session annulée',
        message: 'La session de cours de Mathématiques du Prof. Diallo a été annulée',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // Il y a 2 heures
        isRead: false
    },
    {
        id: 3,
        type: 'COURS_TERMINEE',
        title: 'Cours terminé',
        message: 'Le cours de Physique Chimie - Classe de 1ère S2 vient de se terminer',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // Il y a 3 heures
        isRead: true
    },
    {
        id: 4,
        type: 'NOUVELLE',
        title: 'Nouvelle annonce',
        message: 'Le calendrier des examens du deuxième trimestre est disponible',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // Il y a 5 heures
        isRead: true
    },
    {
        id: 5,
        type: 'EMARGEMENT',
        title: 'Emargement validé',
        message: 'Tous les étudiants ont pointé pour le cours d\'Histoire-Géo',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Il y a 1 jour
        isRead: true
    },
    {
        id: 6,
        type: 'EVALUATION',
        title: 'Nouvelle évaluation',
        message: 'Un devoir de Sciences Naturelles est programmé pour la classe de Terminale S1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // Il y a 2 jours
        isRead: true
    },
    {
        id: 7,
        type: 'NOTE',
        title: 'Notes publiées',
        message: 'Les notes du contrôle continu de Mathématiques sont maintenant disponibles',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // Il y a 3 jours
        isRead: true
    }
];

export function getUnreadCount(notifications: Notification[]): number {
    return notifications.filter(n => !n.isRead).length;
}

export function getNotificationIcon(type: string): string {
    switch (type) {
        case 'INSCRIPTION':
            return '👤';
        case 'SESSION_ANNULEE':
            return '❌';
        case 'COURS_TERMINEE':
            return '✅';
        case 'EMARGEMENT':
            return '📋';
        case 'EVALUATION':
            return '📝';
        case 'NOTE':
            return '📊';
        case 'NOUVELLE':
        default:
            return '🔔';
    }
}

export function formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
        return `Il y a ${minutes} min`;
    } else if (hours < 24) {
        return `Il y a ${hours} h`;
    } else if (days === 1) {
        return 'Hier';
    } else {
        return `Il y a ${days} jours`;
    }
}

