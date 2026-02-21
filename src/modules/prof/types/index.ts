export interface Professeur {
    id: string;
    prenom: string;
    nom: string;
    username: string;
    email: string;
    numero?: string | null;
    specialite?: string | null;
    grade?: string | null;
    modules: string[];
}
