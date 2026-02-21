import { HemargeType, PresenceStatus } from '@/shared/api/types';

export interface Emargement {
    id: string;
    studentId: string;
    sessionId: string;
    date: Date;
    present: boolean;
    hemargeType: HemargeType;
    status: PresenceStatus;
    observations?: string;
    student?: {
        matricule: string;
        nom: string;
        prenom: string;
    };
}
