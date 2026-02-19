export interface SeancePlanning {
    id: number;
    idPlanning: number;
    classe: string;
    cours: string;
    professeur: string;
    salle: string;
    jour: string;
    heureDebut: string;
    heureFin: string;
    couleur: string;
}

export interface PlanningSemaine {
    id: number;
    semaineDebut: string;
    semaineFin: string;
    classe: string;
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
