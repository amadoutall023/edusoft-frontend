import { httpClient } from './httpClient';
import { ActiveYearResponse, ApiResponse } from './types';
import {
    clearStoredActiveYearId,
    notifyActiveYearChanged,
    setStoredActiveYearId
} from './activeYearStorage';

// Types pour la creation et mise a jour des annees scolaires
export interface AnneeScolaireRequest {
    annee: string;
    dateDebut: string;
    dateFin: string;
    description?: string;
}

export interface AnneeScolaireUpdateRequest {
    id: string;
    annee?: string;
    dateDebut?: string;
    dateFin?: string;
    description?: string;
    actif?: boolean;
}

export async function getActiveYear(): Promise<ActiveYearResponse | null> {
    const response = await httpClient<ApiResponse<ActiveYearResponse>>('/api/v1/active-year');
    const year = response.data ?? null;
    if (year?.id) {
        setStoredActiveYearId(year.id);
        notifyActiveYearChanged(year.id);
    } else {
        clearStoredActiveYearId();
        notifyActiveYearChanged(null);
    }
    return year;
}

export async function getAvailableYears(): Promise<ActiveYearResponse[]> {
    const response = await httpClient<ApiResponse<ActiveYearResponse[]>>('/api/v1/active-year/available');
    return response.data ?? [];
}

export async function setActiveYear(yearId: string): Promise<ActiveYearResponse | null> {
    const response = await httpClient<ApiResponse<ActiveYearResponse>>('/api/v1/active-year', {
        method: 'POST',
        body: JSON.stringify({ yearId })
    });
    const year = response.data ?? null;
    const resolvedYearId = year?.id ?? yearId;
    if (resolvedYearId) {
        setStoredActiveYearId(resolvedYearId);
        notifyActiveYearChanged(resolvedYearId);
    } else {
        clearStoredActiveYearId();
        notifyActiveYearChanged(null);
    }
    return year;
}

/**
 * Cree une nouvelle annee scolaire
 * Reserve aux administrateurs
 */
export async function createAnneeScolaire(data: AnneeScolaireRequest): Promise<ActiveYearResponse | null> {
    const response = await httpClient<ApiResponse<ActiveYearResponse>>('/api/v1/annees', {
        method: 'POST',
        body: JSON.stringify({
            ...data,
            actif: false,
            isCurrent: false
        })
    });
    return response.data ?? null;
}

/**
 * Met a jour une annee scolaire (actif ou description)
 */
export async function updateAnneeScolaire(data: AnneeScolaireUpdateRequest): Promise<ActiveYearResponse | null> {
    const response = await httpClient<ApiResponse<ActiveYearResponse>>(`/api/v1/annees/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    return response.data ?? null;
}

/**
 * Active une annee scolaire (une seule peut etre active a la fois)
 */
export async function activateAnneeScolaire(yearId: string): Promise<ActiveYearResponse | null> {
    const response = await httpClient<ApiResponse<ActiveYearResponse>>(`/api/v1/annees/${yearId}/activer`, {
        method: 'POST'
    });
    const year = response.data ?? null;
    if (year?.id) {
        setStoredActiveYearId(year.id);
        notifyActiveYearChanged(year.id);
    }
    return year;
}

/**
 * Desactive une annee scolaire
 */
export async function deactivateAnneeScolaire(yearId: string): Promise<ActiveYearResponse | null> {
    const response = await httpClient<ApiResponse<ActiveYearResponse>>(`/api/v1/annees/${yearId}/statut?actif=false`, {
        method: 'PATCH'
    });
    return response.data ?? null;
}

/**
 * Supprime (soft delete) une annee scolaire
 */
export async function deleteAnneeScolaire(yearId: string): Promise<boolean> {
    const response = await httpClient<ApiResponse<boolean>>(`/api/v1/annees/${yearId}`, {
        method: 'DELETE'
    });
    return response.data ?? false;
}
