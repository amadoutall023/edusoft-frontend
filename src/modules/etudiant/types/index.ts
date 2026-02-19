export interface Etudiant {
    id: number;
    matricule: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    lieuNaissance: string;
    nationalite: string;
    address: string;
    gender: string;
    classe: string;
    anneeInscription: number;
    qrToken: string;
}

export interface ClasseInfo {
    id: number;
    nom: string;
    niveau: string;
    filiere: string;
}

