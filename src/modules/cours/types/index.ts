export interface Cours {
    id: string;
    titre: string;
    niveau: string;
    filiere?: string;
    professeur: string;
    professorId?: string | null;
    moduleId?: string | null;
    volumeHoraire: number;
    heuresPlanifie: number;
    heuresFaites: number;
    heuresRestantes: number;
    progression: number;
    classes?: string[];
    module?: string | null;
    summary?: string | null;
    isArchive?: boolean;
}

export interface StatistiquesCours {
    volumeHoraire: number;
    heuresPlanifie: number;
    heuresFaites: number;
    heuresRestantes: number;
}

export interface FiltreCours {
    niveau?: string;
    filiere?: string;
    classe?: string;
    professeur?: string;
}
