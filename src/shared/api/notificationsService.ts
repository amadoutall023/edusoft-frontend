import { ApiResponse, CoursResponseDto, SessionResponseDto, StudentResponseDto } from '@/shared/api/types';
import { httpClient } from '@/shared/api/httpClient';
import { Notification } from '@/modules/auth/types';

const STUDENTS_ENDPOINT = '/api/v1/students/my-school';
const COURSES_ENDPOINT = '/api/v1/cours?page=0&size=200';
const SESSIONS_ENDPOINT = '/api/v1/sessions?page=0&size=200';

const DAYS_IN_MS = 24 * 60 * 60 * 1000;

function parseDate(dateString?: string | null): Date | null {
    if (!dateString) {
        return null;
    }
    const parsed = new Date(dateString);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isWithinDays(date: Date | null, maxDays: number) {
    if (!date) return false;
    const diff = Date.now() - date.getTime();
    return diff <= maxDays * DAYS_IN_MS;
}

export async function fetchDynamicNotifications(): Promise<Notification[]> {
    const [studentsRes, coursesRes, sessionsRes] = await Promise.all([
        httpClient<ApiResponse<StudentResponseDto[]>>(STUDENTS_ENDPOINT),
        httpClient<ApiResponse<CoursResponseDto[]>>(COURSES_ENDPOINT),
        httpClient<ApiResponse<SessionResponseDto[]>>(SESSIONS_ENDPOINT)
    ]);

    const students = studentsRes.data ?? [];
    const courses = coursesRes.data ?? [];
    const sessions = sessionsRes.data ?? [];

    const notifications: Notification[] = [];
    let counter = 1;

    students
        .filter(student => isWithinDays(parseDate(student.createdAt ?? undefined), 7))
        .slice(0, 3)
        .forEach(student => {
            notifications.push({
                id: counter++,
                type: 'INSCRIPTION',
                title: 'Nouvelle inscription',
                message: `${student.firstName ?? ''} ${student.lastName ?? ''} a rejoint ${student.classe?.libelle ?? 'votre établissement'}`,
                timestamp: parseDate(student.createdAt ?? undefined) ?? new Date(),
                isRead: false
            });
        });

    sessions
        .filter(session => {
            const sessionDate = parseDate(session.date);
            return sessionDate !== null && isWithinDays(sessionDate, 3) && session.status === 'TERMINEE';
        })
        .slice(0, 3)
        .forEach(session => {
            notifications.push({
                id: counter++,
                type: 'COURS_TERMINEE',
                title: 'Cours terminé',
                message: `${session.libelle} (${session.cours?.libelle ?? 'Cours'}) est terminé.`,
                timestamp: parseDate(session.date) ?? new Date(),
                isRead: false
            });
        });

    const overdueSessions = sessions
        .filter(session => {
            const date = parseDate(session.date);
            if (!date) return false;
            return date.getTime() < Date.now() - DAYS_IN_MS && session.status === 'PROGRAMME';
        })
        .slice(0, 2);

    overdueSessions.forEach(session => {
        notifications.push({
            id: counter++,
            type: 'SESSION_ANNULEE',
            title: 'Session en retard',
            message: `${session.libelle} n'a pas encore été démarrée.`,
            timestamp: parseDate(session.date) ?? new Date(),
            isRead: false
        });
    });

    courses
        .filter(course => {
            const total = course.totalHour ?? 0;
            const completed = course.completedHour ?? 0;
            return total > 0 && completed >= total;
        })
        .slice(0, 2)
        .forEach(course => {
            notifications.push({
                id: counter++,
                type: 'NOTE',
                title: 'Objectif atteint',
                message: `Le module ${course.libelle} a atteint ${course.completedHour}/${course.totalHour} heures.`,
                timestamp: new Date(),
                isRead: false
            });
        });

    return notifications
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
}
