import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, StudentResponseDto } from '@/shared/api/types';

export async function fetchStudents(): Promise<StudentResponseDto[]> {
    const response = await httpClient<ApiResponse<StudentResponseDto[]>>('/api/v1/students/my-school');
    return response.data ?? [];
}
