export interface Etudiant {
    id: string;
    matricule: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    lieuNaissance?: string | null;
    nationalite?: string | null;
    address?: string | null;
    gender?: string | null;
    classe?: string | null;
    classeInfo?: ClasseInfo | null;
    anneeInscription?: number | null;
    qrToken?: string | null;
}

export interface ClasseInfo {
    id?: string | null;
    libelle?: string | null;
    filiere?: string | null;
    niveau?: string | null;
}
