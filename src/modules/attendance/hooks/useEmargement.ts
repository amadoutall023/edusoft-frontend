import { useCallback, useEffect, useState } from 'react';

import { Emargement } from '../types/emargementTypes';
import { EmargementService } from '../services/emargement.service';

export const useEmargement = (sessionId?: string) => {
    const [emargements, setEmargements] = useState<Emargement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadEmargements = useCallback(async () => {
        if (!sessionId) {
            setEmargements([]);
            return;
        }
        try {
            setLoading(true);
            const data = await EmargementService.getEmargementsBySession(sessionId);
            setEmargements(data);
            setError(null);
        } catch (err) {
            setError('Impossible de charger les émargements.');
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        void loadEmargements();
    }, [loadEmargements]);

    return { emargements, loading, error, refresh: loadEmargements };
};
