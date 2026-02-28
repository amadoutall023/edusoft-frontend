export interface Etudiant {
    id: string;
    matricule: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    lieuNaissace?: string | null; // typo variant
    lieuNaissnace?: string | null; // correct spelling
    lieuNaissance?: string | null; // another variant
    nationalite?: string | null;
    address?: string | null;
    gender?: string | null;
    classe?: string | null;
    classeInfo?: ClasseInfo | null;
    anneeInscription?: number | null;
    qrToken?: string | null;
    qrCodeImage?: string | null; 
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface ClasseInfo {
    id?: string | null;
    libelle?: string | null;
    filiere?: FiliereInfo | null;
    niveau?: NiveauInfo | null;
}

export interface FiliereInfo {
    id: string;
    libelle: string;
}

export interface NiveauInfo {
    id: string;
    libelle: string;
}


export interface EtudiantFormData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    lieuNaissace?: string; // typo variant
    lieuNaissnace?: string; // correct spelling
    lieuNaissance?: string; // another variant
    nationalite?: string;
    address?: string;
    phone?: string;
    gender?: string;
    classeId?: string;
    typeInscription?: string;
    observations?: string;
}

// Pour les filtres
export interface EtudiantFilters {
    classe?: string;
    anneeInscription?: number;
    gender?: string;
    search?: string;
}
