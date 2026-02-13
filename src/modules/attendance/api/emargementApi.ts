import { Emargement } from '../types/emargementTypes';

export const emargementApi = {
    async fetchEmargements(): Promise<Emargement[]> {
        // Logique pour récupérer les émargements depuis l'API
        const response = await fetch('/api/emargements');
        return response.json();
    },

    async createEmargement(data: Omit<Emargement, 'id'>): Promise<Emargement> {
        // Logique pour créer un nouvel émargement
        const response = await fetch('/api/emargements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    // Autres méthodes API
};