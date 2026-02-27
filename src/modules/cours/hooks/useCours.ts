'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
    CreateCoursePayload,
    UpdateCoursePayload
} from '../services/coursService';
import { CoursResponseDto } from '@/shared/api/types';
import { Cours } from '../types';
import { ApiError } from '@/shared/errors/ApiError';

// Mapping function to convert DTO to local type
const mapCoursDto = (cours: CoursResponseDto): Cours => {
    const total = cours.totalHour ?? 0;
    const completed = cours.completedHour ?? 0;
    const planned = cours.plannedHour ?? 0;
    const progression = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

    console.log('Mapping cours:', cours.id, 'professor:', cours.professor);

    return {
        id: cours.id,
        titre: cours.libelle,
        niveau: cours.classes?.map(classe => classe.libelle).join(' / ') ?? '—',
        filiere: cours.module?.libelle ?? undefined,
        professeur: cours.professor
            ? `${cours.professor.firstName ?? ''} ${cours.professor.lastName ?? ''}`.trim() || 'Non assigné'
            : 'Non assigné',
        professorId: cours.professor?.id ?? null,
        moduleId: cours.module?.id ?? null,
        volumeHoraire: total,
        heuresPlanifie: planned,
        heuresFaites: completed,
        heuresRestantes: Math.max(0, total - completed),
        progression,
        classes: cours.classes?.map(classe => classe.libelle) ?? [],
        module: cours.module?.libelle ?? null
    };
};

interface UseCoursOptions {
    autoFetch?: boolean;
}

interface UseCoursReturn {
    cours: Cours[];
    isLoading: boolean;
    error: string | null;
    fetchCours: () => Promise<void>;
    addCours: (payload: CreateCoursePayload) => Promise<Cours>;
    editCours: (id: string, payload: UpdateCoursePayload) => Promise<Cours>;
    removeCours: (id: string) => Promise<void>;
    getCours: (id: string) => Promise<Cours | null>;
    clearError: () => void;
}

export function useCours(options: UseCoursOptions = {}): UseCoursReturn {
    const { autoFetch = true } = options;

    const [cours, setCours] = useState<Cours[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCours = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchCourses();
            setCours(data.map(mapCoursDto));
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Erreur lors du chargement des cours';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addCours = useCallback(async (payload: CreateCoursePayload): Promise<Cours> => {
        try {
            setIsLoading(true);
            setError(null);
            const created = await createCourse(payload);
            const mapped = mapCoursDto(created);
            setCours(prev => [...prev, mapped]);
            return mapped;
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Erreur lors de la création du cours';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const editCours = useCallback(async (id: string, payload: UpdateCoursePayload): Promise<Cours> => {
        try {
            setIsLoading(true);
            setError(null);
            const updated = await updateCourse(id, payload);
            const mapped = mapCoursDto(updated);
            setCours(prev => prev.map(c => c.id === id ? mapped : c));
            return mapped;
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour du cours';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeCours = useCallback(async (id: string): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            await deleteCourse(id);
            setCours(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Erreur lors de la suppression du cours';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getCours = useCallback(async (id: string): Promise<Cours | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCourseById(id);
            return mapCoursDto(data);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Erreur lors de la récupération du cours';
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchCours();
        }
    }, [autoFetch, fetchCours]);

    return {
        cours,
        isLoading,
        error,
        fetchCours,
        addCours,
        editCours,
        removeCours,
        getCours,
        clearError
    };
}

export default useCours;
