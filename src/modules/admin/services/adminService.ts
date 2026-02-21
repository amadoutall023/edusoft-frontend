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
