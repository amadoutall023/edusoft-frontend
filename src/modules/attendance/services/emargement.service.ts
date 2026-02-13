import { Emargement } from '../types/emargementTypes';

import { emargementApi } from '../api/emargementApi';

export class EmargementService {
    static async getAllEmargements(): Promise<Emargement[]> {
        return await emargementApi.fetchEmargements();
    }

    static async createEmargement(emargement: Omit<Emargement, 'id'>): Promise<Emargement> {
        return await emargementApi.createEmargement(emargement);
    }

    // Autres méthodes selon les besoins
}