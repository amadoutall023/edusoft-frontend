import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse } from '@/shared/api/types';
import { tokenStorage } from '@/shared/api/tokenStorage';

export interface CourseSupportFileDto {
    id: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    cloudinaryUrl?: string | null;
    uploadedAt: string;
    uploadedByProfessorId?: string | null;
    uploadedByFullName?: string | null;
}

export async function listCourseSupports(coursId: string): Promise<CourseSupportFileDto[]> {
    const response = await httpClient<ApiResponse<CourseSupportFileDto[]>>(
        `/api/v1/cours/${coursId}/supports`
    );
    return response.data ?? [];
}

export async function uploadCourseSupport(coursId: string, file: File): Promise<CourseSupportFileDto> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await httpClient<ApiResponse<CourseSupportFileDto>>(
        `/api/v1/cours/${coursId}/supports`,
        {
            method: 'POST',
            body: formData
        }
    );
    if (!response.data) {
        throw new Error('Upload échoué');
    }
    return response.data;
}

export async function deleteCourseSupport(coursId: string, supportId: string): Promise<void> {
    await httpClient<ApiResponse<null>>(
        `/api/v1/cours/${coursId}/supports/${supportId}`,
        { method: 'DELETE' }
    );
}

export async function downloadCourseSupport(
    coursId: string,
    supportId: string,
    fileName: string,
    cloudinaryUrl?: string | null
): Promise<void> {
    if (cloudinaryUrl) {
        window.open(cloudinaryUrl, '_blank', 'noopener,noreferrer');
        return;
    }
    const token = tokenStorage.getAccessToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    //  ?? 'http://localhost:8089'
     ;
    const response = await fetch(`${baseUrl}/api/v1/cours/${coursId}/supports/${supportId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    if (!response.ok) {
        throw new Error('Téléchargement impossible');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
}
