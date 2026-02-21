'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ClasseResponseDto,
    FiliereResponseDto,
    ModuleResponseDto,
    NiveauResponseDto,
    SalleResponseDto,
    UUID
} from '@/shared/api/types';
import {
    fetchClasses,
    fetchFilieres,
    fetchModules,
    fetchNiveaux,
    fetchSalles,
    createClasse,
    createFiliere,
    createModule,
    createNiveau,
    createSalle,
    ClassePayload,
    ModulePayload,
    SallePayload,
    updateClasse,
    deleteClasse,
    updateFiliere,
    deleteFiliere,
    updateModule,
    deleteModule,
    updateNiveau,
    deleteNiveau,
    updateSalle,
    deleteSalle
} from '../services/structureService';
import { ApiError } from '@/shared/errors/ApiError';

interface StructureState {
    classes: ClasseResponseDto[];
    filieres: FiliereResponseDto[];
    modules: ModuleResponseDto[];
    niveaux: NiveauResponseDto[];
    salles: SalleResponseDto[];
}

const initialState: StructureState = {
    classes: [],
    filieres: [],
    modules: [],
    niveaux: [],
    salles: []
};

export function useStructureData() {
    const [state, setState] = useState<StructureState>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const [classesRes, filieresRes, modulesRes, niveauxRes, sallesRes] = await Promise.all([
                fetchClasses(200),
                fetchFilieres(200),
                fetchModules(200),
                fetchNiveaux(200),
                fetchSalles(200)
            ]);
            setState({
                classes: classesRes,
                filieres: filieresRes,
                modules: modulesRes,
                niveaux: niveauxRes,
                salles: sallesRes
            });
            setError(null);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Impossible de charger la structure académique.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    const refreshAfter = useCallback(async <T,>(operation: () => Promise<T>) => {
        const result = await operation();
        await loadAll();
        return result;
    }, [loadAll]);

    const createClasseAction = useCallback(
        async (payload: ClassePayload) => refreshAfter(() => createClasse(payload)),
        [refreshAfter]
    );

    const updateClasseAction = useCallback(
        async (id: UUID, payload: ClassePayload) => refreshAfter(() => updateClasse(id, payload)),
        [refreshAfter]
    );

    const deleteClasseAction = useCallback(
        async (id: UUID) => refreshAfter(() => deleteClasse(id)),
        [refreshAfter]
    );

    const createFiliereAction = useCallback(
        async (libelle: string) => refreshAfter(() => createFiliere({ libelle })),
        [refreshAfter]
    );

    const updateFiliereAction = useCallback(
        async (id: UUID, libelle: string) => refreshAfter(() => updateFiliere(id, { libelle })),
        [refreshAfter]
    );

    const deleteFiliereAction = useCallback(
        async (id: UUID) => refreshAfter(() => deleteFiliere(id)),
        [refreshAfter]
    );

    const createModuleAction = useCallback(
        async (payload: ModulePayload) => refreshAfter(() => createModule(payload)),
        [refreshAfter]
    );

    const updateModuleAction = useCallback(
        async (id: UUID, payload: ModulePayload) => refreshAfter(() => updateModule(id, payload)),
        [refreshAfter]
    );

    const deleteModuleAction = useCallback(
        async (id: UUID) => refreshAfter(() => deleteModule(id)),
        [refreshAfter]
    );

    const createNiveauAction = useCallback(
        async (libelle: string) => refreshAfter(() => createNiveau({ libelle })),
        [refreshAfter]
    );

    const updateNiveauAction = useCallback(
        async (id: UUID, libelle: string) => refreshAfter(() => updateNiveau(id, { libelle })),
        [refreshAfter]
    );

    const deleteNiveauAction = useCallback(
        async (id: UUID) => refreshAfter(() => deleteNiveau(id)),
        [refreshAfter]
    );

    const createSalleAction = useCallback(
        async (payload: SallePayload) => refreshAfter(() => createSalle(payload)),
        [refreshAfter]
    );

    const updateSalleAction = useCallback(
        async (id: UUID, payload: SallePayload) => refreshAfter(() => updateSalle(id, payload)),
        [refreshAfter]
    );

    const deleteSalleAction = useCallback(
        async (id: UUID) => refreshAfter(() => deleteSalle(id)),
        [refreshAfter]
    );

    const filiereOptions = useMemo(
        () => state.filieres.map(filiere => ({ id: filiere.id, libelle: filiere.libelle })),
        [state.filieres]
    );

    const niveauOptions = useMemo(
        () => state.niveaux.map(niveau => ({ id: niveau.id, libelle: niveau.libelle })),
        [state.niveaux]
    );

    return {
        ...state,
        isLoading,
        error,
        reload: loadAll,
        options: {
            filieres: filiereOptions,
            niveaux: niveauOptions
        },
        actions: {
            createClasse: createClasseAction,
            updateClasse: updateClasseAction,
            deleteClasse: deleteClasseAction,
            createFiliere: createFiliereAction,
            updateFiliere: updateFiliereAction,
            deleteFiliere: deleteFiliereAction,
            createModule: createModuleAction,
            updateModule: updateModuleAction,
            deleteModule: deleteModuleAction,
            createNiveau: createNiveauAction,
            updateNiveau: updateNiveauAction,
            deleteNiveau: deleteNiveauAction,
            createSalle: createSalleAction,
            updateSalle: updateSalleAction,
            deleteSalle: deleteSalleAction
        }
    };
}
