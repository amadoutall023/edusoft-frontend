export interface ClasseData {
    id: string;
    libelle: string;
    filiereId: string;
    niveauId: string;
    schoolId: string;
}

export interface NiveauData {
    id?: string;
    libelle: string;
}

export interface FiliereData {
    id: string;
    nom: string;
    code: string;
    description?: string;
}

export interface ModuleData {
    id: string;
    nom: string;
    code: string;
    credits?: number;
    filiereId: string;
    classeId?: string;
}

export interface SalleData {
    id: string;
    nom: string;
    capacite: number;
}
