import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, UserDto } from '@/shared/api/types';

interface FetchMembersParams {
    page?: number;
    size?: number;
}

export async function fetchAdminMembers(params: FetchMembersParams = {}): Promise<ApiResponse<UserDto[]>> {
    const { page = 0, size = 50 } = params;
    return httpClient<ApiResponse<UserDto[]>>(`/api/auth/users?page=${page}&size=${size}`);
}

// Types pour la création d'un membre
interface CreateMemberData {
    firstName: string;
    lastName: string;
    email: string;
    telephone?: string;
    username: string;
    password: string;
    roleName: string;
    poste?: string;
}

export async function createAdminMember(data: CreateMemberData): Promise<UserDto> {
    console.log('Appel API avec:', data);
    return httpClient<UserDto>('/api/v1/admin/members', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}
