import { useCallback, useEffect, useState } from 'react';
import { Notification } from '@/modules/auth/types';
import { fetchDynamicNotifications } from '@/shared/api/notificationsService';
import { tokenStorage } from '@/shared/api/tokenStorage';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setIsLoading(true);
            // Get roles directly from tokenStorage to avoid timing issues
            const roles = tokenStorage.getRoles();
            const payload = await fetchDynamicNotifications(roles);
            setNotifications(payload);
            setError(null);
        } catch (err) {
            console.error('Unable to load notifications', err);
            setError('Impossible de charger les notifications');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return {
        notifications,
        isLoading,
        error,
        refresh: load,
        setNotifications
    };
}
