export interface Cours {
    id: number;
    titre: string;
    niveau: string;
    professeur: string;
    volumeHoraire: number;
    heuresPlanifie: number;
    heuresFaites: number;
    heuresRestantes: number;
    progression: number;
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

