import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, ProfessorResponseDto } from '@/shared/api/types';

const BASE_URL = '/api/v1/professors';

export async function fetchProfessors(): Promise<ProfessorResponseDto[]> {
    const response = await httpClient<ApiResponse<ProfessorResponseDto[]>>(BASE_URL);
    return response.data ?? [];
}
