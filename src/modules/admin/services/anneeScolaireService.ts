import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse } from '@/shared/api/types';
import { AnneeScolaire, AnneeScolaireFormData } from '../types/anneeScolaire';

/**
 * Recupere toutes les annees scolaires de l'ecole de l'utilisateur
 */
export async function fetchAnneeScolaire(): Promise<AnneeScolaire[]> {
    const response = await httpClient<ApiResponse<AnneeScolaire[]>>('/api/v1/annees/moi');
    return response.data ?? [];
}

/**
 * Recupere l'annee scolaire active
 */
export async function fetchActiveAnneeScolaire(): Promise<AnneeScolaire | null> {
    const response = await httpClient<ApiResponse<AnneeScolaire>>('/api/v1/active-year');
    return response.data ?? null;
}

/**
 * Cree une nouvelle annee scolaire
 */
export async function createAnneeScolaire(data: AnneeScolaireFormData): Promise<AnneeScolaire | null> {
    const response = await httpClient<ApiResponse<AnneeScolaire>>('/api/v1/annees', {
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
 * Met a jour une annee scolaire
 */
export async function updateAnneeScolaire(id: string, data: Partial<AnneeScolaireFormData>): Promise<AnneeScolaire | null> {
    const response = await httpClient<ApiResponse<AnneeScolaire>>(`/api/v1/annees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    return response.data ?? null;
}

/**
 * Active une annee scolaire
 */
export async function activateAnneeScolaire(id: string): Promise<AnneeScolaire | null> {
    const response = await httpClient<ApiResponse<AnneeScolaire>>(`/api/v1/annees/${id}/activer`, {
        method: 'POST'
    });
    return response.data ?? null;
}

/**
 * Desactive une annee scolaire
 */
export async function deactivateAnneeScolaire(id: string): Promise<AnneeScolaire | null> {
    // Pour desactiver, on utilise le changement de statut avec actif=false
    const response = await httpClient<ApiResponse<AnneeScolaire>>(`/api/v1/annees/${id}/statut?actif=false`, {
        method: 'PATCH'
    });
    return response.data ?? null;
}

/**
 * Supprime une annee scolaire
 */
export async function deleteAnneeScolaire(id: string): Promise<boolean> {
    const response = await httpClient<ApiResponse<boolean>>(`/api/v1/annees/${id}`, {
        method: 'DELETE'
    });
    return response.data ?? false;
}
