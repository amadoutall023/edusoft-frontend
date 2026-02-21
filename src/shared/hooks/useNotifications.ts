import { useCallback, useEffect, useState } from 'react';
import { Notification } from '@/modules/auth/types';
import { fetchDynamicNotifications } from '@/shared/api/notificationsService';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setIsLoading(true);
            const payload = await fetchDynamicNotifications();
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
