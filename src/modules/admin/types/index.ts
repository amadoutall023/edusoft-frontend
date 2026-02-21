export interface MembreAdministration {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    role: string;
    login: string;
    schoolName?: string | null;
}

export type RoleAdministration = 'Directrice' | 'RP' | 'AC' | 'Administrateur';
