import { SessionMode, SessionStatus, SessionType, UUID } from '@/shared/api/types';

export interface SeancePlanning {
    id: UUID;
    classe: string;
    classeId?: UUID | null;
    cours: string;
    coursId?: UUID | null;
    moduleId?: UUID | null;
    moduleLibelle?: string | null;
    professeur: string;
    professeurId?: UUID | null;
    salle: string;
    salleId?: UUID | null;
    jour: JourSemaine;
    dateISO: string;
    heureDebut: string;
    heureFin: string;
    couleur: string;
    status?: SessionStatus | null;
    typeSession?: SessionType;
    modeSession?: SessionMode;
}

export interface PlanningSemaine {
    id: string;
    semaineDebut: string;
    semaineFin: string;
    classe: string;
    classeId?: UUID | null;
    seances: SeancePlanning[];
    creeLe: string;
}

export type JourSemaine = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';

export type CreneauHoraire = '08H-10H' | '10H-12H' | '13H-15H' | '15H-17H';

export interface FiltrePlanning {
    classe?: string;
    module?: string;
    dateDebut?: string;
    dateFin?: string;
}
