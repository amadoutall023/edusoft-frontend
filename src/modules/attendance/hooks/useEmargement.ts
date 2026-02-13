import { useState, useEffect } from 'react';

import { Emargement } from '../types/emargementTypes';

export const useEmargement = () => {
    const [emargements, setEmargements] = useState<Emargement[]>([]);
    const [loading, setLoading] = useState(false);

    // Logique pour récupérer les émargements
    useEffect(() => {
        // Exemple: fetchEmargements();
    }, []);

    return { emargements, loading, setEmargements };
};