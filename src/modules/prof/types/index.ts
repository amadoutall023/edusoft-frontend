export interface ProfessorModule {
    id: string;
    libelle: string;
}

export interface ProfessorData {
    id: string;
    professorId: string;
    userId: string;
    prenom: string;
    nom: string;
    username: string;
    email: string;
    telephone?: string;
    specialite?: string;
    grade?: string;
    schoolId?: string;
    schoolName?: string;
    roles: string[];
    modules: ProfessorModule[];
}

export interface ProfessorFormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    grade: string;
    specialite?: string;
    telephone?: string;
    moduleIds?: string[];
}
