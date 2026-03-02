import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, CoursResponseDto } from '@/shared/api/types';

const BASE_URL = '/api/v1/cours';

interface FetchCoursesParams {
    page?: number;
    size?: number;
    classeId?: string;
}

export async function fetchCourses(params: FetchCoursesParams = {}): Promise<CoursResponseDto[]> {
    const { page = 0, size = 100, classeId } = params;
    
    let url = `${BASE_URL}?page=${page}&size=${size}`;
    if (classeId) url += `&classeId=${classeId}`;
    
    // Skip year filter to avoid backend serialization issues
    const response = await httpClient<ApiResponse<CoursResponseDto[]>>(url, { skipYearFilter: true });
    return response.data ?? [];
}

export interface CreateCoursePayload {
    libelle: string;
    totalHour: number;
    plannedHour: number;
    moduleId: string;
    classIds: string[];
    professorId?: string;
    summary?: string;
}

export async function createCourse(payload: CreateCoursePayload): Promise<CoursResponseDto> {
    const response = await httpClient<ApiResponse<CoursResponseDto>>(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    if (!response.data) {
        throw new Error('Réponse de création de cours invalide');
    }
    return response.data;
}

export type UpdateCoursePayload = CreateCoursePayload;

export async function updateCourseSummary(id: string, summary: string): Promise<CoursResponseDto> {
    const response = await httpClient<ApiResponse<CoursResponseDto>>(`${BASE_URL}/${id}/summary`, {
        method: 'PATCH',
        body: JSON.stringify({ summary })
    });
    if (!response.data) {
        throw new Error('Réponse de mise à jour de résumé invalide');
    }
    return response.data;
}

export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<CoursResponseDto> {
    const response = await httpClient<ApiResponse<CoursResponseDto>>(`${BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    if (!response.data) {
        throw new Error('Réponse de mise à jour de cours invalide');
    }
    return response.data;
}

export async function deleteCourse(id: string): Promise<void> {
    await httpClient<ApiResponse<null>>(`${BASE_URL}/${id}`, {
        method: 'DELETE'
    });
}

export async function getCourseById(id: string): Promise<CoursResponseDto> {
    const response = await httpClient<ApiResponse<CoursResponseDto>>(`${BASE_URL}/${id}`);
    if (!response.data) {
        throw new Error('Réponse de cours invalide');
    }
    return response.data;
}
