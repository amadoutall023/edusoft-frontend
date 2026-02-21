import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, CoursResponseDto } from '@/shared/api/types';

const BASE_URL = '/api/v1/cours';

interface FetchCoursesParams {
    page?: number;
    size?: number;
}

export async function fetchCourses(params: FetchCoursesParams = {}): Promise<CoursResponseDto[]> {
    const { page = 0, size = 100 } = params;
    const response = await httpClient<ApiResponse<CoursResponseDto[]>>(
        `${BASE_URL}?page=${page}&size=${size}`
    );
    return response.data ?? [];
}

export interface CreateCoursePayload {
    libelle: string;
    totalHour: number;
    plannedHour: number;
    moduleId: string;
    classIds: string[];
    professorId?: string;
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
