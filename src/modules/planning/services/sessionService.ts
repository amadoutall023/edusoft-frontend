import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, Metadata, SessionRequestDto, SessionResponseDto } from '@/shared/api/types';

const BASE_URL = '/api/v1/sessions';

interface FetchSessionsParams {
    page?: number;
    size?: number;
    moduleId?: string;
    filiereId?: string;
    salleId?: string;
    coursId?: string;
}

export interface FetchSessionsResult {
    data: SessionResponseDto[];
    meta?: Metadata | null;
}

export async function fetchSessions(params: FetchSessionsParams = {}): Promise<FetchSessionsResult> {
    const {
        page = 0,
        size = 200,
        moduleId,
        filiereId,
        salleId,
        coursId
    } = params;

    const searchParams = new URLSearchParams({
        page: String(page),
        size: String(size)
    });

    if (moduleId) searchParams.set('moduleId', moduleId);
    if (filiereId) searchParams.set('filiereId', filiereId);
    if (salleId) searchParams.set('salleId', salleId);
    if (coursId) searchParams.set('coursId', coursId);

    const response = await httpClient<ApiResponse<SessionResponseDto[]>>(
        `${BASE_URL}?${searchParams.toString()}`
    );
    return {
        data: response.data ?? [],
        meta: response.meta ?? null
    };
}

export async function createSession(payload: SessionRequestDto): Promise<SessionResponseDto> {
    const response = await httpClient<ApiResponse<SessionResponseDto>>(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    if (!response.data) {
        throw new Error('Session non créée');
    }
    return response.data;
}

export async function updateSession(id: string, payload: SessionRequestDto): Promise<SessionResponseDto> {
    const response = await httpClient<ApiResponse<SessionResponseDto>>(`${BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    if (!response.data) {
        throw new Error('Session non mise à jour');
    }
    return response.data;
}

export async function deleteSession(id: string): Promise<void> {
    await httpClient<ApiResponse<null>>(`${BASE_URL}/${id}`, {
        method: 'DELETE'
    });
}
