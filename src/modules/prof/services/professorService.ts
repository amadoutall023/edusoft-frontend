import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, ProfessorResponseDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';

const BASE_URL = '/api/v1/professors';

export async function fetchProfessors(): Promise<ProfessorResponseDto[]> {
    const response = await httpClient<ApiResponse<ProfessorResponseDto[]>>(BASE_URL);
    return response.data ?? [];
}

export interface ProfessorRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    grade: string;
    specialite?: string;
    telephone?: string;
    moduleIds?: string[];
}

export async function createProfessor(professor: ProfessorRequest): Promise<ProfessorResponseDto> {
    const response = await httpClient<ApiResponse<ProfessorResponseDto>>(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(professor),
    });
    if (!response.data) {
        throw new ApiError(400, 'Failed to create professor');
    }
    return response.data;
}

export async function deleteProfessor(id: string): Promise<void> {
    await httpClient<ApiResponse<null>>(`${BASE_URL}/${id}`, {
        method: 'DELETE',
    });
}

export interface ImportResult {
    imported: number;
    errors: string[];
    total: number;
}

export async function importProfessorsFromExcel(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Use httpClient which now properly handles FormData with auth
        const response = await httpClient<ApiResponse<any>>(`${BASE_URL}/import`, {
            method: 'POST',
            body: formData,
        });

        const data = response.data || {};
        return {
            imported: data.successCount || data.imported || 0,
            errors: data.errors || [],
            total: data.totalRows || data.total || 0,
        };
    } catch (error: any) {
        console.error('Import error details:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, 'Erreur lors de l\'importation: ' + (error?.message || 'Unknown error'));
    }
}
