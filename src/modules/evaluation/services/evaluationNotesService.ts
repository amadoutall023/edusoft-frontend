import { ApiResponse, SessionResponseDto } from '@/shared/api/types';
import { httpClient } from '@/shared/api/httpClient';
import { tokenStorage } from '@/shared/api/tokenStorage';

export interface EvaluationNoteFileDto {
    id: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    cloudinaryUrl?: string | null;
    uploadedAt: string;
    classeId?: string | null;
    classeLibelle?: string | null;
    uploadedByProfessorId?: string | null;
    uploadedByFullName?: string | null;
}

export async function fetchEvaluationSessionDetails(sessionId: string): Promise<SessionResponseDto> {
    const response = await httpClient<ApiResponse<SessionResponseDto>>(`/api/v1/sessions/${sessionId}`);
    if (!response.data) {
        throw new Error('Session introuvable');
    }
    return response.data;
}

export async function listEvaluationNoteFiles(sessionId: string): Promise<EvaluationNoteFileDto[]> {
    const response = await httpClient<ApiResponse<EvaluationNoteFileDto[]>>(
        `/api/v1/sessions/${sessionId}/notes-files`
    );
    return response.data ?? [];
}

export async function uploadEvaluationNoteFile(sessionId: string, file: File, classeId?: string): Promise<EvaluationNoteFileDto> {
    const formData = new FormData();
    formData.append('file', file);
    if (classeId) {
        formData.append('classeId', classeId);
    }
    const response = await httpClient<ApiResponse<EvaluationNoteFileDto>>(
        `/api/v1/sessions/${sessionId}/notes-files`,
        {
            method: 'POST',
            body: formData
        }
    );
    if (!response.data) {
        throw new Error('Upload impossible');
    }
    return response.data;
}

export async function deleteEvaluationNoteFile(sessionId: string, fileId: string): Promise<void> {
    await httpClient<ApiResponse<null>>(
        `/api/v1/sessions/${sessionId}/notes-files/${fileId}`,
        {
            method: 'DELETE'
        }
    );
}

export async function downloadEvaluationNoteFile(
    sessionId: string,
    fileId: string,
    fileName: string,
    cloudinaryUrl?: string | null
): Promise<void> {
    if (cloudinaryUrl) {
        window.open(cloudinaryUrl, '_blank', 'noopener,noreferrer');
        return;
    }
    const token = tokenStorage.getAccessToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8089';
    const response = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}/notes-files/${fileId}/download`, {
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
