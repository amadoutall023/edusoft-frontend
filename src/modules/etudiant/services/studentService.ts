import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, StudentResponseDto } from '@/shared/api/types';

const API_BASE = '/api/v1/students';
const PRESENCE_API_BASE = '/api/v1/presences';

// Types
export interface StudentRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    lieuNaissance?: string;
    nationalite?: string;
    address?: string;
    phone?: string;
    gender?: string;
    classeId?: string;
    typeInscription?: string;
    observations?: string;
}

export interface StudentFilters {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

// API Functions
export async function fetchStudents(filters?: StudentFilters): Promise<PaginatedResponse<StudentResponseDto>> {
    const params = new URLSearchParams();
    if (filters?.page !== undefined) params.set('page', filters.page.toString());
    if (filters?.size !== undefined) params.set('size', filters.size.toString());
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.sortDir) params.set('sortDir', filters.sortDir);

    const query = params.toString();
    const response = await httpClient<ApiResponse<PaginatedResponse<StudentResponseDto>>>(
        `${API_BASE}${query ? '?' + query : ''}`
    );
    return response.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };
}

export async function fetchStudentsList(): Promise<StudentResponseDto[]> {
    const response = await httpClient<ApiResponse<StudentResponseDto[]>>(`${API_BASE}/list`);
    return response.data ?? [];
}

export async function fetchStudentsByClasse(classeId: string): Promise<StudentResponseDto[]> {
    const response = await httpClient<ApiResponse<StudentResponseDto[]>>(`${API_BASE}/classe/${classeId}`);
    return response.data ?? [];
}

export async function searchStudents(q: string, page = 0, size = 20): Promise<PaginatedResponse<StudentResponseDto>> {
    const params = new URLSearchParams({ q, page: page.toString(), size: size.toString() });
    const response = await httpClient<ApiResponse<PaginatedResponse<StudentResponseDto>>>(
        `${API_BASE}/search?${params}`
    );
    return response.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };
}

export async function searchStudentsList(q: string): Promise<StudentResponseDto[]> {
    const params = new URLSearchParams({ q });
    const response = await httpClient<ApiResponse<StudentResponseDto[]>>(`${API_BASE}/search/list?${params}`);
    return response.data ?? [];
}

export async function fetchStudentsByYear(year: number): Promise<StudentResponseDto[]> {
    const response = await httpClient<ApiResponse<StudentResponseDto[]>>(`${API_BASE}/year/${year}`);
    return response.data ?? [];
}

export async function fetchStudentById(studentId: string): Promise<StudentResponseDto> {
    const response = await httpClient<ApiResponse<StudentResponseDto>>(`${API_BASE}/${studentId}`);
    return response.data!;
}

export async function fetchStudentByMatricule(matricule: string): Promise<StudentResponseDto> {
    const response = await httpClient<ApiResponse<StudentResponseDto>>(`${API_BASE}/matricule/${matricule}`);
    return response.data!;
}

export async function createStudent(student: StudentRequest): Promise<StudentResponseDto> {
    const response = await httpClient<ApiResponse<StudentResponseDto>>(API_BASE, {
        method: 'POST',
        body: JSON.stringify(student)
    });
    return response.data!;
}

export async function updateStudent(studentId: string, student: Partial<StudentRequest>): Promise<StudentResponseDto> {
    const response = await httpClient<ApiResponse<StudentResponseDto>>(`${API_BASE}/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify(student)
    });
    return response.data!;
}

export async function deleteStudent(studentId: string): Promise<void> {
    await httpClient<void>(`${API_BASE}/${studentId}`, {
        method: 'DELETE'
    });
}

export async function assignStudentToClasse(studentId: string, classeId: string): Promise<StudentResponseDto> {
    const params = new URLSearchParams({ classeId });
    const response = await httpClient<ApiResponse<StudentResponseDto>>(
        `${API_BASE}/${studentId}/classe?${params}`,
        { method: 'PATCH' }
    );
    return response.data!;
}

export async function removeStudentFromClasse(studentId: string): Promise<StudentResponseDto> {
    const response = await httpClient<ApiResponse<StudentResponseDto>>(
        `${API_BASE}/${studentId}/classe/remove`,
        { method: 'PATCH' }
    );
    return response.data!;
}

export async function importStudentsFromExcel(file: File, autoGenerateMatricule = true): Promise<{
    totalRows: number;
    successCount: number;
    skipCount: number;
    errorCount: number;
    errors: string[];
}> {
    const formData = new FormData();
    formData.append('file', file);
    if (!autoGenerateMatricule) {
        formData.append('autoGenerateMatricule', 'false');
    }

    const response = await httpClient<ApiResponse<any>>(`${API_BASE}/import`, {
        method: 'POST',
        body: formData
    });
    return response.data ?? { totalRows: 0, successCount: 0, skipCount: 0, errorCount: 0, errors: [] };
}

export async function generateMatricule(): Promise<string> {
    const response = await httpClient<ApiResponse<string>>(`${API_BASE}/generate-matricule`);
    return response.data ?? '';
}

export async function countStudents(): Promise<number> {
    const response = await httpClient<ApiResponse<number>>(`${API_BASE}/count`);
    return response.data ?? 0;
}

export async function countStudentsByClasse(classeId: string): Promise<number> {
    const response = await httpClient<ApiResponse<number>>(`${API_BASE}/count/classe/${classeId}`);
    return response.data ?? 0;
}

// Types pour les statistiques d'absences
export interface AbsenceStats {
    studentId: string;
    matricule: string;
    nom: string;
    prenom: string;
    totalAbsences: number;
    justifiedAbsences: number;
    unjustifiedAbsences: number;
}

/**
 * Récupérer les statistiques d'absences pour un étudiant
 */
export async function fetchStudentAbsenceStats(studentId: string): Promise<AbsenceStats> {
    const response = await httpClient<ApiResponse<AbsenceStats>>(`${PRESENCE_API_BASE}/student/${studentId}/stats`);
    return response.data!;
}

/**
 * Récupérer les statistiques d'absences pour tous les étudiants d'une classe
 */
export async function fetchClasseAbsenceStats(classeId: string): Promise<AbsenceStats[]> {
    const response = await httpClient<ApiResponse<AbsenceStats[]>>(`${PRESENCE_API_BASE}/classe/${classeId}/stats`);
    return response.data ?? [];
}

// ============================================================================
// FONCTIONS POUR LE DASHBOARD ETUDIANT
// ============================================================================

/**
 * Récupérer les informations de l'étudiant connecté (depuis le token)
 * Cette fonction utilise l'endpoint /me du backend pour récupérer les infos de l'utilisateur connecté
 */
export async function fetchCurrentStudent(): Promise<StudentResponseDto> {
    const response = await httpClient<ApiResponse<StudentResponseDto>>('/api/v1/students/me', {
        suppressErrorLog: true
    });
    return response.data!;
}

/**
 * Récupérer les sessions à venir pour l'étudiant
 */
export async function fetchStudentUpcomingSessions(): Promise<any[]> {
    const response = await httpClient<ApiResponse<any[]>>('/api/v1/sessions/upcoming', {
        suppressErrorLog: true
    });
    return response.data ?? [];
}

/**
 * Récupérer les présences de l'étudiant pour calculer le pourcentage
 */
export async function fetchStudentPresenceStats(): Promise<{
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    excusedCount: number;
    presenceRate: number;
}> {
    const response = await httpClient<ApiResponse<{
        totalSessions: number;
        presentCount: number;
        absentCount: number;
        excusedCount: number;
        presenceRate: number;
    }>>('/api/v1/presences/my-stats', {
        suppressErrorLog: true
    });
    return response.data ?? {
        totalSessions: 0,
        presentCount: 0,
        absentCount: 0,
        excusedCount: 0,
        presenceRate: 0
    };
}
