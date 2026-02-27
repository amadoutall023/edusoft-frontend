import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, SessionResponseDto } from '@/shared/api/types';

export interface DashboardACStats {
    etudiantsInscrits: number;
    coursAujourdhui: number;
    absencesAujourdhui: number;
    messagesNonLus: number;
}

export interface SessionWithDetails {
    id: string;
    libelle: string;
    date: string;
    startHour: string;
    endHour: string;
    professor?: {
        firstName?: string;
        lastName?: string;
    };
    salle?: {
        libelle: string;
    };
    classe?: {
        libelle: string;
    };
    status?: string;
}

/**
 * Récupère les statistiques du dashboard de l'Attaché de Classe
 */
export async function fetchDashboardACStats(): Promise<DashboardACStats> {
    try {
        const response = await httpClient<ApiResponse<DashboardACStats>>('/api/v1/dashboard/ac/stats', {
            method: 'GET'
        });

        return {
            etudiantsInscrits: response.data.etudiantsInscrits || 0,
            coursAujourdhui: response.data.coursAujourdhui || 0,
            absencesAujourdhui: response.data.absencesAujourdhui || 0,
            messagesNonLus: response.data.messagesNonLus || 0
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        // Retourner des valeurs par défaut en cas d'erreur
        return {
            etudiantsInscrits: 0,
            coursAujourdhui: 0,
            absencesAujourdhui: 0,
            messagesNonLus: 0
        };
    }
}

/**
 * Récupère les sessions du jour pour l'Attaché de Classe
 */
export async function fetchTodaySessions(): Promise<SessionWithDetails[]> {
    try {
        const response = await httpClient<ApiResponse<SessionResponseDto[]>>('/api/v1/dashboard/ac/sessions/today', {
            method: 'GET'
        });

        return response.data.map((session: SessionResponseDto) => ({
            id: session.id,
            libelle: session.libelle,
            date: session.date,
            startHour: session.startHour,
            endHour: session.endHour,
            professor: session.professor,
            salle: session.salle,
            classe: session.classe,
            status: session.status
        } as SessionWithDetails));
    } catch (error) {
        console.error('Erreur lors de la récupération des sessions:', error);
        return [];
    }
}

/**
 * Récupère les alertes pour l'Attaché de Classe
 */
export async function fetchACAlerts(): Promise<string[]> {
    try {
        const response = await httpClient<ApiResponse<string[]>>('/api/v1/alerts/ac', {
            method: 'GET'
        });
        return response.data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des alertes:', error);
        return [];
    }
}

