import { UUID } from '@/shared/api/types';

export interface AnneeScolaire {
    id: UUID;
    annee: string;
    dateDebut: string;
    dateFin: string;
    description?: string | null;
    isCurrent: boolean;
    actif: boolean;
    dateCreation?: string | null;
    dateModification?: string | null;
    schoolId?: UUID | null;
}

export interface AnneeScolaireFormData {
    annee: string;
    dateDebut: string;
    dateFin: string;
    description?: string;
}
