import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, Metadata, NoteStatus, SessionResponseDto, SessionType, UUID } from '@/shared/api/types';
import { Evaluation, EvaluationFromBackend, StatistiqueEvaluation, ClasseOption } from '../types';

const BASE_URL = '/api/v1/sessions';

// Fonction pour convertir une session en évaluation
function mapSessionToEvaluation(session: SessionResponseDto): Evaluation {
    const now = new Date();
    const sessionDate = new Date(session.date);

    // Déterminer le statut de l'évaluation
    let statut: 'A venir' | 'Passées';
    if (session.status === 'PROGRAMME' || sessionDate > now) {
        statut = 'A venir';
    } else {
        statut = 'Passées';
    }

    // Mapper le statut des notes du backend au format frontend
    let statutNote: 'A deposer' | 'Note deposees' | 'Note en retard' = 'A deposer';
    if (session.noteStatus) {
        switch (session.noteStatus) {
            case 'DEPOSEE':
            case 'VALIDEE':
                statutNote = 'Note deposees';
                break;
            case 'EN_RETARD':
            case 'REFUSEE':
                statutNote = 'Note en retard';
                break;
            default:
                statutNote = 'A deposer';
        }
    }

    // Formater le nom du professeur
    const professeur = session.professor
        ? `Prof : ${session.professor.prenom || ''} ${session.professor.nom || ''}`.trim()
        : 'Professeur non assigné';

    // Formater la date
    const dateDepot = sessionDate.toLocaleDateString('fr-FR');

    return {
        id: parseInt(session.id.replace(/-/g, '').substring(0, 8), 16),
        uuid: session.id, // Stocker l'UUID pour les appels API
        titre: session.libelle,
        classe: session.classe?.libelle || session.classes?.map(c => c.libelle).join(', ') || 'Classe non assignée',
        professeur,
        dateDepot,
        statut,
        statutNote
    };
}

// Interface pour les paramètres de requête
export interface EvaluationsQuery {
    page?: number;
    size?: number;
    classeId?: UUID;
    moduleId?: UUID;
    professorId?: UUID;
    typeSession?: SessionType;
    status?: string;
    noteStatus?: NoteStatus;
}

// Interface pour la réponse paginée
export interface EvaluationsResponse {
    evaluations: Evaluation[];
    metadata: Metadata;
}

// Récupérer toutes les évaluations
export async function fetchEvaluations(query: EvaluationsQuery = {}): Promise<EvaluationsResponse> {
    const { page = 0, size = 100, classeId, moduleId, professorId, typeSession = 'EVALUATION', status, noteStatus } = query;

    // Construire les paramètres de requête
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', Math.max(size, 500).toString()); // Augmenter à 500 pour récupérer plus de données

    if (classeId) params.append('classeId', classeId);
    if (moduleId) params.append('moduleId', moduleId);
    if (professorId) params.append('professorId', professorId);
    if (typeSession) params.append('typeSession', typeSession);
    if (status) params.append('status', status);
    if (noteStatus) params.append('noteStatus', noteStatus);

    console.log('Fetching evaluations from:', `${BASE_URL}?${params.toString()}`);

    const response = await httpClient<ApiResponse<SessionResponseDto[]>>(
        `${BASE_URL}?${params.toString()}`
    );

    console.log('Raw API response:', response);
    console.log('Response data:', response.data);

    // Filtre de sécurité côté frontend (le backend filtre déjà via typeSession)
    const allSessions = response.data || [];
    const evaluationSessions = allSessions.filter(session => session.typeSession === 'EVALUATION');
    const evaluations = evaluationSessions.map(mapSessionToEvaluation);

    return {
        evaluations,
        metadata: response.meta || {
            page,
            size,
            totalElements: evaluations.length,
            totalPages: 1
        }
    };
}

// Récupérer une évaluation par ID
export async function fetchEvaluationById(id: UUID): Promise<Evaluation | null> {
    const response = await httpClient<ApiResponse<SessionResponseDto>>(
        `${BASE_URL}/${id}`
    );

    if (response.data && response.data.typeSession === 'EVALUATION') {
        return mapSessionToEvaluation(response.data);
    }

    return null;
}

// Récupérer les statistiques des évaluations
export async function fetchEvaluationsStats(): Promise<StatistiqueEvaluation[]> {
    // Récupérer toutes les sessions sans filtrer par type pour avoir les stats complets
    const response = await httpClient<ApiResponse<SessionResponseDto[]>>(
        `${BASE_URL}?page=0&size=1000`
    );

    const allSessions = response.data || [];
    const evaluationSessions = allSessions.filter(session => session.typeSession === 'EVALUATION');

    // Mapper pour le format d'évaluation
    const evaluations = evaluationSessions.map(mapSessionToEvaluation);

    const stats: StatistiqueEvaluation[] = [
        {
            statut: 'A venir',
            nombre: evaluations.filter(e => e.statut === 'A venir').length,
            couleur: 'blue',
            icon: 'calendar'
        },
        {
            statut: 'Passées',
            nombre: evaluations.filter(e => e.statut === 'Passées').length,
            couleur: 'gray',
            icon: 'clipboard'
        },
        {
            statut: 'Note deposees',
            nombre: evaluations.filter(e => e.statutNote === 'Note deposees').length,
            couleur: 'green',
            icon: 'check'
        },
        {
            statut: 'Note en retard',
            nombre: evaluations.filter(e => e.statutNote === 'Note en retard').length,
            couleur: 'red',
            icon: 'x'
        }
    ];

    console.log('Stats calculated:', stats);

    return stats;
}

// Récupérer la liste des classes pour les filtres
export async function fetchClassesForFilter(): Promise<ClasseOption[]> {
    const response = await httpClient<ApiResponse<{ id: UUID; libelle: string }[]>>(
        '/api/v1/classes?page=0&size=500'
    );

    return (response.data || []).map(c => ({
        id: c.id,
        libelle: c.libelle
    }));
}

// Interface pour créer une évaluation
export interface CreateEvaluationPayload {
    libelle: string;
    date: string;
    startHour: string;
    endHour: string;
    typeSession: SessionType;
    modeSession: 'PRESENTIEL' | 'EN_LIGNE' | 'HYBRIDE';
    moduleId?: UUID;
    classeId?: UUID;
    classIds?: UUID[];
    professorId?: UUID;
    salleId?: UUID;
}

// Créer une nouvelle évaluation
export async function createEvaluation(payload: CreateEvaluationPayload): Promise<Evaluation> {
    // Convertir les dates et heures au format attendu par le backend
    const requestBody = {
        ...payload,
        date: payload.date,
        startHour: payload.startHour,
        endHour: payload.endHour,
        typeSession: 'EVALUATION' as SessionType,
        // Utiliser null au lieu de undefined pour les champs vides
        moduleId: payload.moduleId || null,
        classeId: payload.classeId || null,
        professorId: payload.professorId || null,
        salleId: payload.salleId || null,
        classIds: payload.classIds || null,
        status: 'PROGRAMME'
    };

    console.log('Creating evaluation with payload:', JSON.stringify(requestBody, null, 2));

    const response = await httpClient<ApiResponse<SessionResponseDto>>(
        BASE_URL,
        {
            method: 'POST',
            body: JSON.stringify(requestBody)
        }
    );

    console.log('Response from server:', JSON.stringify(response, null, 2));

    if (!response.data) {
        throw new Error('La création a échoué - aucune donnée retournée');
    }

    return mapSessionToEvaluation(response.data);
}

// Mettre à jour le statut d'une évaluation
export async function updateEvaluationStatus(
    id: string,
    status: 'PROGRAMME' | 'EN_COURS' | 'TERMINEE' | 'ANNULE'
): Promise<Evaluation> {
    const response = await httpClient<ApiResponse<SessionResponseDto>>(
        `${BASE_URL}/${id}/status`,
        {
            method: 'PATCH',
            body: JSON.stringify({ status })
        }
    );

    return mapSessionToEvaluation(response.data);
}

// Récupérer les modules pour le formulaire
export async function fetchModulesForForm(): Promise<{ id: UUID; libelle: string }[]> {
    const response = await httpClient<ApiResponse<{ id: UUID; libelle: string }[]>>(
        '/api/v1/modules?page=0&size=500'
    );

    return (response.data || []).map(m => ({
        id: m.id,
        libelle: m.libelle
    }));
}

// Récupérer les professeurs pour le formulaire
export async function fetchProfessorsForForm(): Promise<{ id: UUID; firstName: string; lastName: string }[]> {
    const response = await httpClient<ApiResponse<{ professorId: UUID; firstName: string; lastName: string }[]>>(
        '/api/v1/professors'
    );

    return (response.data || []).map(p => ({
        id: p.professorId,
        firstName: p.firstName,
        lastName: p.lastName
    }));
}

// Récupérer les salles pour le formulaire
export async function fetchSallesForForm(): Promise<{ id: UUID; libelle: string }[]> {
    const response = await httpClient<ApiResponse<{ id: UUID; libelle: string }[]>>(
        '/api/v1/salles?page=0&size=500'
    );

    return (response.data || []).map(s => ({
        id: s.id,
        libelle: s.libelle
    }));
}
