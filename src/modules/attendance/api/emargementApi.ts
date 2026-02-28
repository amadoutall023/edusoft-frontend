import { httpClient } from '@/shared/api/httpClient';
import {
    ApiResponse,
    HemargeRequestDto,
    HemargeResponseDto
} from '@/shared/api/types';

const BASE_URL = '/api/v1/presences';

export const emargementApi = {
    async fetchEmargements(sessionId: string): Promise<HemargeResponseDto[]> {
        const response = await httpClient<ApiResponse<HemargeResponseDto[]>>(
            `${BASE_URL}/session/${sessionId}`
        );
        return response.data ?? [];
    },

    async createEmargement(payload: HemargeRequestDto): Promise<HemargeResponseDto> {
        const response = await httpClient<ApiResponse<HemargeResponseDto>>(`${BASE_URL}/hemarger`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return response.data as HemargeResponseDto;
    }
};
