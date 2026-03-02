import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse } from '@/shared/api/types';
import { UUID, SessionResponseDto, HemargeResponseDto, StudentResponseDto } from '@/shared/api/types';
import { tokenStorage } from '@/shared/api/tokenStorage';

// ============================================================================
// TYPES POUR LE DASHBOARD ETUDIANT
// ============================================================================

export interface StudentPresenceStats {
    studentId: string;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    excusedCount: number;
    tardyCount: number;
    presenceRate: number;
}

// Type pour les stats d'absence du backend
interface BackendStudentAbsenceStats {
    studentId: string;
    matricule: string;
    nom: string;
    prenom: string;
    totalAbsences: number;
    justifiedAbsences: number;
    unjustifiedAbsences: number;
}

export interface StudentAbsenceRecord {
    id: string;
    sessionId: string;
    sessionDate: string;
    sessionLibelle: string;
    moduleLibelle: string;
    professorNom: string;
    professorPrenom: string;
    startHour: string;
    endHour: string;
    status: 'ABSENT' | 'EXCUSE' | 'RETARD';
    justifiee: boolean;
    hours: number;
}

export interface CoursEtudiant {
    id: string;
    libelle: string;
    moduleLibelle: string;
    totalHour: number;
    completedHour: number;
    plannedHour: number;
    professorNom: string;
    professorPrenom: string;
    professorGrade?: string;
}

export interface EvaluationEtudiant {
    id: string;
    moduleLibelle: string;
    professorNom: string;
    professorPrenom: string;
    sessionLibelle: string;
    sessionDate: string;
    typeSession: 'COURS' | 'EVALUATION' | 'AUTRE';
    note?: number;
    moyenneClasse?: number;
    coefficient?: number;
    published: boolean;
}

export interface QRCodeResponse {
    qrCodeImage: string; // base64
    qrToken: string;
    expiresAt?: string;
}

// ============================================================================
// FONCTIONS API POUR LE DASHBOARD ETUDIANT
// ============================================================================

/**
 * Recuperer les informations de l'etudiant connecte
 */
export async function fetchCurrentStudent(): Promise<StudentResponseDto | null> {
    try {
        const response = await httpClient<ApiResponse<StudentResponseDto>>(
            '/api/v1/students/me',
            { suppressErrorLog: true }
        );
        return response.data ?? null;
    } catch (error) {
        console.warn('Impossible de recuperer les infos etudiant');
        return null;
    }
}

/**
 * Recuperer les statistiques de presence de l'etudiant par son ID
 */
export async function fetchStudentPresenceStats(studentId: string): Promise<StudentPresenceStats> {
    try {
        const response = await httpClient<ApiResponse<BackendStudentAbsenceStats>>(
            `/api/v1/presences/student/${studentId}/stats`,
            { suppressErrorLog: true }
        );

        const stats = response.data;
        if (!stats) {
            return {
                studentId: '',
                totalSessions: 0,
                presentCount: 0,
                absentCount: 0,
                excusedCount: 0,
                tardyCount: 0,
                presenceRate: 0
            };
        }

     
        const totalAbsences = stats.totalAbsences || 0;
        const excusedCount = stats.justifiedAbsences || 0;
        const absentCount = stats.unjustifiedAbsences || 0;

        // Calculer le taux de presence
        // On estime le total des sessions a partir des absences (approximatif)
        const totalSessions = totalAbsences + 10; // Valeur par defaut, a ajuster
        const presentCount = Math.max(0, totalSessions - totalAbsences);
        const presenceRate = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

        return {
            studentId: stats.studentId || studentId,
            totalSessions,
            presentCount,
            absentCount,
            excusedCount,
            tardyCount: 0,
            presenceRate
        };
    } catch (error) {
        console.warn('Erreur lors de la recuperation des stats de presence:', error);
        return {
            studentId: '',
            totalSessions: 0,
            presentCount: 0,
            absentCount: 0,
            excusedCount: 0,
            tardyCount: 0,
            presenceRate: 0
        };
    }
}

/**
 * Recuperer les statistiques de presence de l'etudiant connecte
 */
export async function fetchMyPresenceStats(): Promise<StudentPresenceStats> {
    try {
        const student = await fetchCurrentStudent();
        if (!student?.id) {
            return {
                studentId: '',
                totalSessions: 0,
                presentCount: 0,
                absentCount: 0,
                excusedCount: 0,
                tardyCount: 0,
                presenceRate: 0
            };
        }

        return await fetchStudentPresenceStats(student.id);
    } catch (error) {
        return {
            studentId: '',
            totalSessions: 0,
            presentCount: 0,
            absentCount: 0,
            excusedCount: 0,
            tardyCount: 0,
            presenceRate: 0
        };
    }
}

/**
 * Recuperer les cours par classe
 */
export async function fetchCoursByClasse(classeId: string): Promise<CoursEtudiant[]> {
    try {
        // Skip year filter to avoid backend serialization issues
        const response = await httpClient<ApiResponse<any>>(
            `/api/v1/cours?classeId=${classeId}&size=100`,
            { suppressErrorLog: true, skipYearFilter: true }
        );
        // Le backend retourne { data: { content: [...] }, meta: {...} }
        const content = response.data?.content || response.data || [];
        return content.map((c: any) => ({
            id: c.id,
            libelle: c.libelle,
            moduleLibelle: c.module?.libelle || '',
            totalHour: c.totalHour || 0,
            completedHour: c.completedHour || 0,
            plannedHour: c.plannedHour || 0,
            professorNom: c.professor?.lastName || '',
            professorPrenom: c.professor?.firstName || '',
            professorGrade: c.professor?.grade
        }));
    } catch (error) {
        return [];
    }
}

/**
 * Recuperer les cours de la classe de l'etudiant
 */
export async function fetchMyCours(): Promise<CoursEtudiant[]> {
    try {
        const student = await fetchCurrentStudent();
        if (!student?.classe?.id) {
            return [];
        }
        return await fetchCoursByClasse(student.classe.id);
    } catch (error) {
        return [];
    }
}

/**
 * Recuperer les sessions par classe - en utilisant /api/v1/sessions?classeId=xxx
 */
export async function fetchSessionsByClasse(classeId: string): Promise<SessionResponseDto[]> {
    try {
        console.log('Fetching sessions for classeId:', classeId);

        // Skip year filter to avoid backend serialization issues
        const response = await httpClient<ApiResponse<any>>(
            `/api/v1/sessions?classeId=${classeId}&size=100`,
            { suppressErrorLog: true, skipYearFilter: true }
        );

        console.log('Sessions response:', response);

        // Le backend retourne { success: true, data: [...], meta: {...} }
        // data est directement un tableau car sessions.getContent() est appelé
        let content: any[] = [];
        if (Array.isArray(response.data)) {
            content = response.data;
        } else if (response.data?.content) {
            content = response.data.content;
        }

        console.log('Sessions content:', content);
        return content;
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return [];
    }
}

/**
 * Recuperer toutes les sessions de l'etudiant (pour le planning)
 */
export async function fetchMySessions(
    startDate?: string,
    endDate?: string
): Promise<SessionResponseDto[]> {
    try {
        const student = await fetchCurrentStudent();
        if (!student?.classe?.id) {
            console.log('Student ou classe non trouvé:', student);
            return [];
        }

        // Debug: afficher l'ID de la classe
        console.log('ID de la classe:', student.classe.id);

        // Skip year filter to avoid backend serialization issues
        let url = `/api/v1/sessions?classeId=${student.classe.id}&size=100`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        console.log('URL des sessions:', url);

        const response = await httpClient<ApiResponse<any>>(url, { suppressErrorLog: true, skipYearFilter: true });

        // Debug: afficher la réponse
        console.log('Réponse sessions:', response);

        // Le backend retourne { success: true, data: [...], meta: {...} }
        // data est directement un tableau car sessions.getContent() est appelé
        let content: any[] = [];
        if (Array.isArray(response.data)) {
            content = response.data;
        } else if (response.data?.content) {
            content = response.data.content;
        }
        console.log('Sessions trouvée:', content.length);
        return content;
    } catch (error) {
        console.error('Erreur lors de la recuperation des sessions:', error);
        return [];
    }
}

/**
 * Recuperer les sessions a venir pour l'etudiant
 */
export async function fetchMyUpcomingSessions(): Promise<SessionResponseDto[]> {
    try {
        const sessions = await fetchMySessions();
        const now = new Date();
        return sessions.filter(s => new Date(s.date) >= now).slice(0, 5);
    } catch (error) {
        return [];
    }
}

/**
 * Recuperer le QR code de l'etudiant
 */
export async function fetchMyQRCode(): Promise<QRCodeResponse | null> {
    try {
        const token = tokenStorage.getAccessToken();
        if (!token) {
            return null;
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        //  ?? 'http://localhost:8089';
        const response = await fetch(`${API_BASE_URL}/api/auth/me/qrcode`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return null;
        }

        const blob = await response.blob();
        const base64 = await blobToBase64(blob);

        return {
            qrCodeImage: base64,
            qrToken: ''
        };
    } catch (error) {
        console.warn('Impossible de recuperer le QR code');
        return null;
    }
}

// Helper function to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Enregistrer une presence via QR code
 */
export async function registerPresenceByQR(
    qrToken: string,
    sessionId: string,
    hemargeType: 'DEBUT' | 'FIN'
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await httpClient<ApiResponse<{ success: boolean; message: string }>>(
            '/api/v1/presences/hemarger',
            {
                method: 'POST',
                body: JSON.stringify({
                    qrToken,
                    sessionId,
                    hemargeType
                })
            }
        );
        return response.data ?? { success: false, message: 'Erreur lors de l\'enregistrement' };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Erreur lors de l\'enregistrement'
        };
    }
}

/**
 * Enregistrer une presence avec les donnees du scanner
 */
export async function registerPresence(
    sessionId: string,
    hemargeType: 'DEBUT' | 'FIN',
    latitude?: number,
    longitude?: number
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await httpClient<ApiResponse<{ success: boolean; message: string }>>(
            '/api/v1/presences/hemarger',
            {
                method: 'POST',
                body: JSON.stringify({
                    sessionId,
                    hemargeType,
                    latitude,
                    longitude
                })
            }
        );
        return response.data ?? { success: false, message: 'Erreur lors de l\'enregistrement' };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Erreur lors de l\'enregistrement'
        };
    }
}

// Endpoints pour les absences - utilise les donnees du backend
// Note: Le backend retourne des donnees differentes, on retourne un tableau vide pour l'instant
export async function fetchMyAbsences(): Promise<StudentAbsenceRecord[]> {
    try {
        const student = await fetchCurrentStudent();
        if (!student?.id) {
            return [];
        }

        // TODO: Implementer un endpoint pour recuperer les presences detaillees de l'etudiant
        // Pour l'instant, on retourne les donnees basees sur les stats
        const stats = await fetchStudentPresenceStats(student.id);

        // Creer des enregistrements d'absence simules a partir des stats
        const absences: StudentAbsenceRecord[] = [];
        if (stats.absentCount > 0) {
            absences.push({
                id: `${student.id}-absent`,
                sessionId: '',
                sessionDate: new Date().toISOString().split('T')[0],
                sessionLibelle: 'Session enregistree',
                moduleLibelle: 'Voir le details',
                professorNom: '',
                professorPrenom: '',
                startHour: '',
                endHour: '',
                status: 'ABSENT',
                justifiee: false,
                hours: stats.absentCount * 2 // Estimation
            });
        }

        return absences;
    } catch (error) {
        return [];
    }
}

export async function fetchMyPresences(): Promise<HemargeResponseDto[]> {
    // TODO: Implementer quand l'endpoint sera disponible
    return [];
}

export async function fetchMyEvaluations(): Promise<EvaluationEtudiant[]> {
    try {
        const response = await httpClient<ApiResponse<any>>(
            '/api/v1/students/me/evaluations',
            { suppressErrorLog: true }
        );

        const sessions = response.data || [];

        // Transform backend data to EvaluationEtudiant format
        return sessions.map((session: any) => ({
            id: session.id,
            moduleLibelle: session.module?.libelle || session.cours?.module?.libelle || '',
            professorNom: session.professor?.nom || '',
            professorPrenom: session.professor?.prenom || '',
            sessionLibelle: session.libelle || '',
            sessionDate: session.date,
            typeSession: session.typeSession,
            note: undefined, // Notes not available yet
            moyenneClasse: undefined,
            coefficient: undefined,
            published: session.noteStatus === 'PUBLIE'
        }));
    } catch (error) {
        console.warn('Erreur lors de la recuperation des evaluations:', error);
        return [];
    }
}

export async function fetchMyNotes(): Promise<{
    evaluations: EvaluationEtudiant[];
    moyenneGenerale: number;
    totalCredits: number;
    creditsObtenus: number;
}> {
    try {
        const evaluations = await fetchMyEvaluations();

        // Calculer la moyenne generale
        const evaluationsWithNotes = evaluations.filter(e => e.note !== undefined);
        const moyenneGenerale = evaluationsWithNotes.length > 0
            ? evaluationsWithNotes.reduce((sum, e) => sum + (e.note || 0), 0) / evaluationsWithNotes.length
            : 0;

        return {
            evaluations,
            moyenneGenerale,
            totalCredits: 0,
            creditsObtenus: 0
        };
    } catch (error) {
        console.warn('Erreur lors de la recuperation des notes:', error);
        return {
            evaluations: [],
            moyenneGenerale: 0,
            totalCredits: 0,
            creditsObtenus: 0
        };
    }
}
