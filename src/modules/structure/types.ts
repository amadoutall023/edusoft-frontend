export interface ClasseData {
    id: number;
    libelle: string;
    filiereId: string;
    niveauId: string;
    schoolId: string;
}

export interface NiveauData {
    libelle: string;
}

export interface FiliereData {
    id: number;
    nom: string;
    code: string;
    description?: string;
}

export interface ModuleData {
    id: number;
    nom: string;
    code: string;
    credits?: number;
    filiereId: string;
}

export interface SalleData {
    id: number;
    nom: string;
    capacite: number;
}

