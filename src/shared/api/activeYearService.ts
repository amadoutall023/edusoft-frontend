import { httpClient } from './httpClient';
import { ActiveYearResponse, ApiResponse } from './types';

export async function getActiveYear(): Promise<ActiveYearResponse | null> {
    const response = await httpClient<ApiResponse<ActiveYearResponse>>('/api/v1/active-year');
    return response.data ?? null;
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
    return response.data ?? null;
}
