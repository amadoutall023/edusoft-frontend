import { httpClient, HttpRequestOptions } from '@/shared/api/httpClient';

export type HemargeType = 'DEBUT' | 'FIN';
export type PresenceStatus = 'PRESENT' | 'ABSENT' | 'RETARD' | 'EXCUSE';

export interface HemargeResponseDto {
  id: string;
  type: 'ETUDIANT' | 'PROFESSEUR';
  studentId?: string;
  studentMatricule?: string;
  studentNom?: string;
  studentPrenom?: string;
  professorId?: string;
  professorMatricule?: string;
  professorNom?: string;
  professorPrenom?: string;
  sessionId: string;
  sessionCode: string;
  hemargeAt: string;
  hemargeType: HemargeType;
  status: PresenceStatus;
  hemargePar?: string;
  tableNumber?: string;
  latitude?: number;
  longitude?: number;
  observations?: string;
  createdAt: string;
}

export interface PresenceStats {
  presents: number;
  absents: number;
  excuses: number;
  retards: number;
  total: number;
  tauxPresence: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  metadata?: object;
}

/**
 * Récupérer les présences d'une session pour un type d'hémargement
 */
export async function getPresencesBySessionAndType(
  sessionId: string,
  hemargeType: HemargeType
): Promise<HemargeResponseDto[]> {
  const response = await httpClient<ApiResponse<HemargeResponseDto[]>>(
    `/api/v1/presences/session/${sessionId}/type/${hemargeType}`,
    { method: 'GET' }
  );
  return response.data;
}

/**
 * Récupérer les présences des étudiants pour un type d'hémargement
 */
export async function getPresencesEtudiantsByType(
  sessionId: string,
  hemargeType: HemargeType
): Promise<HemargeResponseDto[]> {
  const response = await httpClient<ApiResponse<HemargeResponseDto[]>>(
    `/api/v1/presences/session/${sessionId}/etudiants/hemarge-type/${hemargeType}`,
    { method: 'GET' }
  );
  return response.data;
}

/**
 * Récupérer la présence du professeur pour un type d'hémargement
 */
export async function getPresenceProfesseurByType(
  sessionId: string,
  hemargeType: HemargeType
): Promise<HemargeResponseDto | null> {
  try {
    const response = await httpClient<ApiResponse<HemargeResponseDto>>(
      `/api/v1/presences/session/${sessionId}/professor/hemarge-type/${hemargeType}`,
      { method: 'GET' }
    );
    return response.data;
  } catch (error) {
    return null;
  }
}

/**
 * Hémarger le professeur d'une session
 */
export async function hemargerProfesseur(
  sessionId: string,
  professorId: string,
  hemargeType: HemargeType,
  hemargePar: string = 'PROFESSEUR'
): Promise<HemargeResponseDto> {
  const response = await httpClient<ApiResponse<HemargeResponseDto>>(
    `/api/v1/presences/session/${sessionId}/professor/${professorId}/hemarger?hemargeType=${hemargeType}&hemargePar=${hemargePar}`,
    { method: 'POST' }
  );
  return response.data;
}

/**
 * Initialiser les présences pour tous les étudiants d'une session
 */
export async function initialiserPresencesEtudiants(
  sessionId: string,
  hemargeType: HemargeType,
  hemargePar: string = 'SYSTEM'
): Promise<HemargeResponseDto[]> {
  const response = await httpClient<ApiResponse<HemargeResponseDto[]>>(
    `/api/v1/presences/session/${sessionId}/initialiser-presences?hemargeType=${hemargeType}&hemargePar=${hemargePar}`,
    { method: 'POST' }
  );
  return response.data;
}

/**
 * Mettre à jour le statut de présence d'un étudiant
 */
export async function mettreAJourPresenceEtudiant(
  sessionId: string,
  studentId: string,
  hemargeType: HemargeType,
  nouveauStatut: PresenceStatus
): Promise<HemargeResponseDto> {
  const response = await httpClient<ApiResponse<HemargeResponseDto>>(
    `/api/v1/presences/session/${sessionId}/student/${studentId}/hemarge-type/${hemargeType}?nouveauStatut=${nouveauStatut}`,
    { method: 'PUT' }
  );
  return response.data;
}

/**
 * Mettre à jour les présences en masse
 */
export async function mettreAJourPresencesBatch(
  sessionId: string,
  hemargeType: HemargeType,
  studentIds: string[],
  nouveauStatut: PresenceStatus
): Promise<HemargeResponseDto[]> {
  const response = await httpClient<ApiResponse<HemargeResponseDto[]>>(
    `/api/v1/presences/session/${sessionId}/hemarge-type/${hemargeType}/batch?nouveauStatut=${nouveauStatut}`,
    { 
      method: 'PUT',
      body: JSON.stringify(studentIds)
    }
  );
  return response.data;
}

/**
 * Récupérer les statistiques de présence d'une session
 */
export async function getSessionPresenceStats(
  sessionId: string
): Promise<PresenceStats> {
  const response = await httpClient<ApiResponse<PresenceStats>>(
    `/api/v1/presences/session/${sessionId}/stats`,
    { method: 'GET' }
  );
  const data = response.data;
  return {
    ...data,
    total: data.presents + data.absents + data.excuses + data.retards,
    tauxPresence: data.total > 0 ? (data.presents / data.total) * 100 : 0
  };
}
