import { httpClient } from './httpClient';
import { ActiveYearResponse, ApiResponse } from './types';
import {
    clearStoredActiveYearId,
    notifyActiveYearChanged,
    setStoredActiveYearId
} from './activeYearStorage';

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
