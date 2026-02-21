import { httpClient } from '@/shared/api/httpClient';
import {
    ApiResponse,
    ClasseResponseDto,
    FiliereResponseDto,
    ModuleResponseDto,
    NiveauResponseDto,
    SalleResponseDto,
    UUID
} from '@/shared/api/types';

const withPagination = (path: string, size = 100) => `${path}?page=0&size=${size}`;

export interface ClassePayload {
    libelle: string;
    filiereId: UUID;
    niveauId: UUID;
    schoolId: UUID;
}

export interface FilierePayload {
    libelle: string;
}

export interface ModulePayload {
    libelle: string;
    filiereId?: UUID | null;
}

export interface NiveauPayload {
    libelle: string;
}

export interface SallePayload {
    libelle: string;
    capacity?: number;
}

export async function fetchClasses(size = 100): Promise<ClasseResponseDto[]> {
    const response = await httpClient<ApiResponse<ClasseResponseDto[]>>(withPagination('/api/v1/classes', size));
    return response.data ?? [];
}

export async function fetchFilieres(size = 100): Promise<FiliereResponseDto[]> {
    const response = await httpClient<ApiResponse<FiliereResponseDto[]>>(withPagination('/api/v1/filieres', size));
    return response.data ?? [];
}

export async function fetchModules(size = 100): Promise<ModuleResponseDto[]> {
    const response = await httpClient<ApiResponse<ModuleResponseDto[]>>(withPagination('/api/v1/modules', size));
    return response.data ?? [];
}

export async function fetchNiveaux(size = 100): Promise<NiveauResponseDto[]> {
    const response = await httpClient<ApiResponse<NiveauResponseDto[]>>(withPagination('/api/v1/niveaux', size));
    return response.data ?? [];
}

export async function fetchSalles(size = 100): Promise<SalleResponseDto[]> {
    const response = await httpClient<ApiResponse<SalleResponseDto[]>>(withPagination('/api/v1/salles', size));
    return response.data ?? [];
}

export async function updateClasse(id: UUID, payload: ClassePayload): Promise<ClasseResponseDto> {
    const response = await httpClient<ApiResponse<ClasseResponseDto>>(`/api/v1/classes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function deleteClasse(id: UUID): Promise<void> {
    await httpClient<ApiResponse<null>>(`/api/v1/classes/${id}`, {
        method: 'DELETE'
    });
}

export async function createClasse(payload: ClassePayload): Promise<ClasseResponseDto> {
    const response = await httpClient<ApiResponse<ClasseResponseDto>>('/api/v1/classes', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function createFiliere(payload: FilierePayload): Promise<FiliereResponseDto> {
    const response = await httpClient<ApiResponse<FiliereResponseDto>>('/api/v1/filieres', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function updateFiliere(id: UUID, payload: FilierePayload): Promise<FiliereResponseDto> {
    const response = await httpClient<ApiResponse<FiliereResponseDto>>(`/api/v1/filieres/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function deleteFiliere(id: UUID): Promise<void> {
    await httpClient<ApiResponse<null>>(`/api/v1/filieres/${id}`, {
        method: 'DELETE'
    });
}

export async function createModule(payload: ModulePayload): Promise<ModuleResponseDto> {
    const response = await httpClient<ApiResponse<ModuleResponseDto>>('/api/v1/modules', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function updateModule(id: UUID, payload: ModulePayload): Promise<ModuleResponseDto> {
    const response = await httpClient<ApiResponse<ModuleResponseDto>>(`/api/v1/modules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function deleteModule(id: UUID): Promise<void> {
    await httpClient<ApiResponse<null>>(`/api/v1/modules/${id}`, {
        method: 'DELETE'
    });
}

export async function createNiveau(payload: NiveauPayload): Promise<NiveauResponseDto> {
    const response = await httpClient<ApiResponse<NiveauResponseDto>>('/api/v1/niveaux', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function updateNiveau(id: UUID, payload: NiveauPayload): Promise<NiveauResponseDto> {
    const response = await httpClient<ApiResponse<NiveauResponseDto>>(`/api/v1/niveaux/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function deleteNiveau(id: UUID): Promise<void> {
    await httpClient<ApiResponse<null>>(`/api/v1/niveaux/${id}`, {
        method: 'DELETE'
    });
}

export async function createSalle(payload: SallePayload): Promise<SalleResponseDto> {
    const response = await httpClient<ApiResponse<SalleResponseDto>>('/api/v1/salles', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function updateSalle(id: UUID, payload: SallePayload): Promise<SalleResponseDto> {
    const response = await httpClient<ApiResponse<SalleResponseDto>>(`/api/v1/salles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function deleteSalle(id: UUID): Promise<void> {
    await httpClient<ApiResponse<null>>(`/api/v1/salles/${id}`, {
        method: 'DELETE'
    });
}
