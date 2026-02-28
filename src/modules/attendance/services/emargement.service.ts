import { emargementApi } from '../api/emargementApi';
import { Emargement } from '../types/emargementTypes';
import { HemargeRequestDto } from '@/shared/api/types';

export class EmargementService {
    static async getEmargementsBySession(sessionId: string): Promise<Emargement[]> {
        const records = await emargementApi.fetchEmargements(sessionId);
        return records.map(record => ({
            id: record.id,
            studentId: record.studentId,
            sessionId: record.sessionId,
            date: new Date(record.hemargeAt),
            present: record.status === 'PRESENT',
            student: {
                matricule: record.studentMatricule,
                nom: record.studentNom ?? '',
                prenom: record.studentPrenom ?? ''
            },
            hemargeType: record.hemargeType,
            status: record.status,
            observations: record.observations ?? undefined
        }));
    }

    static async createEmargement(request: HemargeRequestDto) {
        return emargementApi.createEmargement(request);
    }
}
