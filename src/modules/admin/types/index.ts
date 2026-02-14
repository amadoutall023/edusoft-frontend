export interface MembreAdministration {
    id: number;
    prenom: string;
    nom: string;
    telephone: string;
    role: string;
    login: string;
}

export type RoleAdministration = 'Directrice' | 'RP' | 'AC';

