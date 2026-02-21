export type UUID = string;

export interface Metadata {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    data: T;
    meta?: Metadata | null;
}

export interface RoleDto {
    id: UUID;
    name: string;
    description?: string | null;
}

export interface SchoolDto {
    id: UUID;
    nom: string;
    adresse?: string | null;
    telephone?: string | null;
    email?: string | null;
    ville?: string | null;
    pays?: string | null;
}

export interface UserDto {
    id: UUID;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    telephone?: string | null;
    roles: RoleDto[];
    ecole?: SchoolDto | null;
    enabled: boolean;
    createdAt?: string;
    updatedAt?: string;
    qrToken?: string | null;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    /**
     * Durée de vie en secondes.
     */
    expiresIn: number;
}

export interface SchoolInfoResponse {
    id: UUID;
    nom: string;
    adresse?: string | null;
    telephone?: string | null;
    email?: string | null;
    ville?: string | null;
    pays?: string | null;
    actif?: boolean | null;
}

export interface AuthResponse {
    userId: UUID;
    email: string;
    firstName: string;
    lastName: string;
    ecoleId?: UUID | null;
    ecole?: SchoolInfoResponse | null;
    roles: string[];
    tokens: TokenResponse;
}

export interface ClasseInfoDto {
    id?: UUID | null;
    libelle?: string | null;
    filiere?: SimpleRef | null;
    niveau?: SimpleRef | null;
}

export interface SimpleRef {
    id?: UUID | null;
    libelle?: string | null;
}

export interface StudentResponseDto {
    id: UUID;
    matricule: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    lieuNaissance?: string | null;
    nationalite?: string | null;
    address?: string | null;
    gender?: string | null;
    classe?: ClasseInfoDto | null;
    anneeInscription?: number | null;
    qrToken?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface StudentInfoDto {
    id: UUID;
    matricule: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
}

export interface ClasseResponseDto {
    id: UUID;
    libelle: string;
    filiere?: SimpleRef | null;
    niveau?: SimpleRef | null;
    school?: {
        id?: UUID | null;
        nom?: string | null;
    } | null;
    students?: StudentInfoDto[] | null;
}

export interface FiliereResponseDto {
    id: UUID;
    libelle: string;
    modules?: ModuleSimpleDto[] | null;
}

export interface ModuleSimpleDto {
    id: UUID;
    libelle: string;
}

export interface ModuleResponseDto {
    id: UUID;
    libelle: string;
    filiere?: ModuleSimpleDto | null;
    cours?: CoursSimpleDto[] | null;
}

export interface CoursSimpleDto {
    id: UUID;
    libelle: string;
}

export interface CoursResponseDto {
    id: UUID;
    libelle: string;
    totalHour: number;
    completedHour: number;
    plannedHour: number;
    module?: ModuleSimpleDto | null;
    classes?: ClasseSimpleDto[] | null;
    professor?: CourseProfessorDto | null;
}

export interface ClasseSimpleDto {
    id: UUID;
    libelle: string;
}

export interface CourseProfessorDto {
    id: UUID;
    firstName?: string | null;
    lastName?: string | null;
    grade?: string | null;
    specialite?: string | null;
}

export interface NiveauResponseDto {
    id: UUID;
    libelle: string;
}

export interface SalleResponseDto {
    id: UUID;
    libelle: string;
    capacity?: number | null;
}

export interface ActiveYearResponse {
    id: UUID;
    annee: string;
    dateDebut: string;
    dateFin: string;
    description?: string | null;
    isCurrent: boolean;
    actif: boolean;
    dateCreation?: string | null;
    dateModification?: string | null;
}

export interface ProfessorResponseDto {
    professorId: UUID;
    userId: UUID;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    telephone?: string | null;
    grade?: string | null;
    specialite?: string | null;
    schoolId?: UUID | null;
    schoolName?: string | null;
    roles: string[];
    modules: ProfessorModuleDto[];
}

export interface ProfessorModuleDto {
    id: UUID;
    libelle: string;
}

export type SessionMode = 'PRESENTIEL' | 'EN_LIGNE' | 'HYBRIDE';
export type SessionType = 'COURS' | 'EVALUATION' | 'AUTRE';
export type SessionStatus = 'PROGRAMME' | 'EN_COURS' | 'TERMINEE';
export interface SessionRequestDto {
    date: string;
    startHour: string;
    endHour: string;
    duration?: number | null;
    typeSession: SessionType;
    modeSession: SessionMode;
    status?: SessionStatus | null;
    libelle: string;
    sessionSummary?: string | null;
    coursId?: UUID | null;
    moduleId?: UUID | null;
    classeId?: UUID | null;
    classIds?: UUID[] | null;
    professorId?: UUID | null;
    salleId?: UUID | null;
}

export interface SessionResponseDto {
    id: UUID;
    date: string;
    startHour: string;
    endHour: string;
    codeSession?: string | null;
    duration?: number | null;
    typeSession: SessionType;
    modeSession: SessionMode;
    status?: SessionStatus | null;
    libelle: string;
    sessionSummary?: string | null;
    cours?: CoursSimpleDto | null;
    module?: ModuleSimpleDto | null;
    classe?: ClasseSimpleDto | null;
    classes?: ClasseSimpleDto[] | null;
    professor?: SessionProfessorDto | null;
    students?: SessionStudentDto[] | null;
    salle?: SalleSimpleDto | null;
}

export interface SessionProfessorDto {
    id: UUID;
    nom?: string | null;
    prenom?: string | null;
    grade?: string | null;
}

export interface SessionStudentDto {
    id: UUID;
    matricule: string;
    nom?: string | null;
    prenom?: string | null;
}

export interface SalleSimpleDto {
    id: UUID;
    libelle: string;
}

export type HemargeType = 'DEBUT' | 'FIN';
export type PresenceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSE' | 'RETARD';

export interface HemargeResponseDto {
    id: UUID;
    studentId: UUID;
    studentMatricule: string;
    studentNom?: string | null;
    studentPrenom?: string | null;
    sessionId: UUID;
    sessionCode?: string | null;
    hemargeAt: string;
    hemargeType: HemargeType;
    status: PresenceStatus;
    hemargePar?: string | null;
    tableNumber?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    observations?: string | null;
    createdAt?: string | null;
}

export interface HemargeRequestDto {
    studentId: UUID;
    sessionId: UUID;
    hemargeType: HemargeType;
    tableNumber?: string;
    latitude?: number;
    longitude?: number;
    observations?: string;
    hemargePar?: string;
}
