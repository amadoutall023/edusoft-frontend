import { httpClient } from '@/shared/api/httpClient';
import {
    ApiResponse,
    ClasseResponseDto,
    FiliereResponseDto,
    Metadata,
    ModuleResponseDto,
    NiveauResponseDto,
    SalleResponseDto,
    UUID
} from '@/shared/api/types';

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

export interface StructureListQuery {
    page?: number;
    size?: number;
    sort?: string;
    q?: string;
}

export interface ClassesQuery extends StructureListQuery {
    schoolId?: UUID;
    filiereId?: UUID;
    niveauId?: UUID;
}

export interface FilieresQuery extends StructureListQuery {
    schoolId?: UUID;
}

export interface ModulesQuery extends StructureListQuery {
    schoolId?: UUID;
    filiereId?: UUID;
}

export interface NiveauxQuery extends StructureListQuery {
    schoolId?: UUID;
}

export interface SallesQuery extends StructureListQuery {
    schoolId?: UUID;
    minCapacity?: number;
    maxCapacity?: number;
}

export interface PagedResult<T> {
    items: T[];
    meta: Metadata | null;
}

const DEFAULT_QUERY: Required<Pick<StructureListQuery, 'page' | 'size' | 'sort'>> = {
    page: 0,
    size: 10,
    sort: 'libelle,asc'
};

function buildQueryString(query: Record<string, string | number | undefined | null>): string {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
        }
    });
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

function normalizePagedResponse<T>(response: ApiResponse<T[]>): PagedResult<T> {
    return {
        items: response.data ?? [],
        meta: response.meta ?? null
    };
}

export async function fetchClassesPage(query: ClassesQuery = {}): Promise<PagedResult<ClasseResponseDto>> {
    const response = await httpClient<ApiResponse<ClasseResponseDto[]>>(
        `/api/v1/classes${buildQueryString({
            page: query.page ?? DEFAULT_QUERY.page,
            size: query.size ?? DEFAULT_QUERY.size,
            sort: query.sort ?? DEFAULT_QUERY.sort,
            q: query.q,
            schoolId: query.schoolId,
            filiereId: query.filiereId,
            niveauId: query.niveauId
        })}`
    );
    return normalizePagedResponse(response);
}

export async function fetchFilieresPage(query: FilieresQuery = {}): Promise<PagedResult<FiliereResponseDto>> {
    const response = await httpClient<ApiResponse<FiliereResponseDto[]>>(
        `/api/v1/filieres${buildQueryString({
            page: query.page ?? DEFAULT_QUERY.page,
            size: query.size ?? DEFAULT_QUERY.size,
            sort: query.sort ?? DEFAULT_QUERY.sort,
            q: query.q,
            schoolId: query.schoolId
        })}`
    );
    return normalizePagedResponse(response);
}

export async function fetchModulesPage(query: ModulesQuery = {}): Promise<PagedResult<ModuleResponseDto>> {
    const response = await httpClient<ApiResponse<ModuleResponseDto[]>>(
        `/api/v1/modules${buildQueryString({
            page: query.page ?? DEFAULT_QUERY.page,
            size: query.size ?? DEFAULT_QUERY.size,
            sort: query.sort ?? DEFAULT_QUERY.sort,
            q: query.q,
            schoolId: query.schoolId,
            filiereId: query.filiereId
        })}`
    );
    return normalizePagedResponse(response);
}

export async function fetchNiveauxPage(query: NiveauxQuery = {}): Promise<PagedResult<NiveauResponseDto>> {
    const response = await httpClient<ApiResponse<NiveauResponseDto[]>>(
        `/api/v1/niveaux${buildQueryString({
            page: query.page ?? DEFAULT_QUERY.page,
            size: query.size ?? DEFAULT_QUERY.size,
            sort: query.sort ?? DEFAULT_QUERY.sort,
            q: query.q,
            schoolId: query.schoolId
        })}`
    );
    return normalizePagedResponse(response);
}

export async function fetchSallesPage(query: SallesQuery = {}): Promise<PagedResult<SalleResponseDto>> {
    const response = await httpClient<ApiResponse<SalleResponseDto[]>>(
        `/api/v1/salles${buildQueryString({
            page: query.page ?? DEFAULT_QUERY.page,
            size: query.size ?? DEFAULT_QUERY.size,
            sort: query.sort ?? DEFAULT_QUERY.sort,
            q: query.q,
            schoolId: query.schoolId,
            minCapacity: query.minCapacity,
            maxCapacity: query.maxCapacity
        })}`
    );
    return normalizePagedResponse(response);
}

export async function updateClasse(id: UUID, payload: ClassePayload): Promise<ClasseResponseDto> {
    const response = await httpClient<ApiResponse<ClasseResponseDto>>(`/api/v1/classes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function patchClasse(id: UUID, payload: Partial<ClassePayload>): Promise<ClasseResponseDto> {
    const response = await httpClient<ApiResponse<ClasseResponseDto>>(`/api/v1/classes/${id}`, {
        method: 'PATCH',
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

export async function patchFiliere(id: UUID, payload: Partial<FilierePayload>): Promise<FiliereResponseDto> {
    const response = await httpClient<ApiResponse<FiliereResponseDto>>(`/api/v1/filieres/${id}`, {
        method: 'PATCH',
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

export async function patchModule(id: UUID, payload: Partial<ModulePayload>): Promise<ModuleResponseDto> {
    const response = await httpClient<ApiResponse<ModuleResponseDto>>(`/api/v1/modules/${id}`, {
        method: 'PATCH',
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

export async function patchNiveau(id: UUID, payload: Partial<NiveauPayload>): Promise<NiveauResponseDto> {
    const response = await httpClient<ApiResponse<NiveauResponseDto>>(`/api/v1/niveaux/${id}`, {
        method: 'PATCH',
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

export async function patchSalle(id: UUID, payload: Partial<SallePayload>): Promise<SalleResponseDto> {
    const response = await httpClient<ApiResponse<SalleResponseDto>>(`/api/v1/salles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });
    return response.data;
}

export async function deleteSalle(id: UUID): Promise<void> {
    await httpClient<ApiResponse<null>>(`/api/v1/salles/${id}`, {
        method: 'DELETE'
    });
}

// Legacy helpers kept for backward compatibility in other modules.
export function fetchClasses(size: number): Promise<ClasseResponseDto[]>;
export function fetchClasses(query?: ClassesQuery): Promise<PagedResult<ClasseResponseDto>>;
export async function fetchClasses(queryOrSize: ClassesQuery | number = {}): Promise<PagedResult<ClasseResponseDto> | ClasseResponseDto[]> {
    if (typeof queryOrSize === 'number') {
        const result = await fetchClassesPage({ page: 0, size: queryOrSize });
        return result.items;
    }
    return fetchClassesPage(queryOrSize);
}

export function fetchFilieres(size: number): Promise<FiliereResponseDto[]>;
export function fetchFilieres(query?: FilieresQuery): Promise<PagedResult<FiliereResponseDto>>;
export async function fetchFilieres(queryOrSize: FilieresQuery | number = {}): Promise<PagedResult<FiliereResponseDto> | FiliereResponseDto[]> {
    if (typeof queryOrSize === 'number') {
        const result = await fetchFilieresPage({ page: 0, size: queryOrSize });
        return result.items;
    }
    return fetchFilieresPage(queryOrSize);
}

export function fetchModules(size: number): Promise<ModuleResponseDto[]>;
export function fetchModules(query?: ModulesQuery): Promise<PagedResult<ModuleResponseDto>>;
export async function fetchModules(queryOrSize: ModulesQuery | number = {}): Promise<PagedResult<ModuleResponseDto> | ModuleResponseDto[]> {
    if (typeof queryOrSize === 'number') {
        const result = await fetchModulesPage({ page: 0, size: queryOrSize });
        return result.items;
    }
    return fetchModulesPage(queryOrSize);
}

export function fetchNiveaux(size: number): Promise<NiveauResponseDto[]>;
export function fetchNiveaux(query?: NiveauxQuery): Promise<PagedResult<NiveauResponseDto>>;
export async function fetchNiveaux(queryOrSize: NiveauxQuery | number = {}): Promise<PagedResult<NiveauResponseDto> | NiveauResponseDto[]> {
    if (typeof queryOrSize === 'number') {
        const result = await fetchNiveauxPage({ page: 0, size: queryOrSize });
        return result.items;
    }
    return fetchNiveauxPage(queryOrSize);
}

export function fetchSalles(size: number): Promise<SalleResponseDto[]>;
export function fetchSalles(query?: SallesQuery): Promise<PagedResult<SalleResponseDto>>;
export async function fetchSalles(queryOrSize: SallesQuery | number = {}): Promise<PagedResult<SalleResponseDto> | SalleResponseDto[]> {
    if (typeof queryOrSize === 'number') {
        const result = await fetchSallesPage({ page: 0, size: queryOrSize });
        return result.items;
    }
    return fetchSallesPage(queryOrSize);
}
