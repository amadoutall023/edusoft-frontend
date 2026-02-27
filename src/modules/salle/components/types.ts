export interface Salle {
    id: number;
    numero: string;
    etage: string;
    capacite: number;
    statut: 'Libre' | 'Occupee';
    ocupationActuelle?: {
        cours: string;
        classe: string;
        professeur: string;
    };
    prochaineCourse?: {
        heure: string;
    };
    emploiDuTemps?: PlanningSlot[];
}

export interface PlanningSlot {
    id: number;
    heureDebut: string;
    heureFin: string;
    cours: string;
    classe: string;
    professeur: string;
    estLibre: boolean;
}

export interface StatistiqueSalle {
    label: string;
    nombre: number;
    couleur: string;
    icon: string;
}

export interface FiltreSalle {
    recherche?: string;
    heures?: string;
    date?: string;
    statut?: string;
    etage?: string;
}
