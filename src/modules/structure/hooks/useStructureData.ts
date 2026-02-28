'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
    ClasseResponseDto,
    FiliereResponseDto,
    Metadata,
    ModuleResponseDto,
    NiveauResponseDto,
    SalleResponseDto,
    UUID
} from '@/shared/api/types';
import {
    fetchClassesPage,
    fetchFilieresPage,
    fetchModulesPage,
    fetchNiveauxPage,
    fetchSallesPage,
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
    deleteSalle,
    ClassesQuery,
    FilieresQuery,
    ModulesQuery,
    NiveauxQuery,
    SallesQuery
} from '../services/structureService';
import { ApiError } from '@/shared/errors/ApiError';

export function useStructureData(activeTab: string) {
    const [classes, setClasses] = useState<ClasseResponseDto[]>([]);
    const [filieres, setFilieres] = useState<FiliereResponseDto[]>([]);
    const [modules, setModules] = useState<ModuleResponseDto[]>([]);
    const [niveaux, setNiveaux] = useState<NiveauResponseDto[]>([]);
    const [salles, setSalles] = useState<SalleResponseDto[]>([]);

    const [classesMeta, setClassesMeta] = useState<Metadata | null>(null);
    const [filieresMeta, setFilieresMeta] = useState<Metadata | null>(null);
    const [modulesMeta, setModulesMeta] = useState<Metadata | null>(null);
    const [niveauxMeta, setNiveauxMeta] = useState<Metadata | null>(null);
    const [sallesMeta, setSallesMeta] = useState<Metadata | null>(null);

    const [classesQuery, setClassesQuery] = useState<ClassesQuery>({ page: 0, size: 10, sort: 'libelle,asc' });
    const [filieresQuery, setFilieresQuery] = useState<FilieresQuery>({ page: 0, size: 10, sort: 'libelle,asc' });
    const [modulesQuery, setModulesQuery] = useState<ModulesQuery>({ page: 0, size: 10, sort: 'libelle,asc' });
    const [niveauxQuery, setNiveauxQuery] = useState<NiveauxQuery>({ page: 0, size: 10, sort: 'libelle,asc' });
    const [sallesQuery, setSallesQuery] = useState<SallesQuery>({ page: 0, size: 10, sort: 'libelle,asc' });

    // Use refs to store latest query values to avoid infinite loops in useEffect
    const classesQueryRef = useRef(classesQuery);
    const filieresQueryRef = useRef(filieresQuery);
    const modulesQueryRef = useRef(modulesQuery);
    const niveauxQueryRef = useRef(niveauxQuery);
    const sallesQueryRef = useRef(sallesQuery);

    // Keep refs in sync with state
    classesQueryRef.current = classesQuery;
    filieresQueryRef.current = filieresQuery;
    modulesQueryRef.current = modulesQuery;
    niveauxQueryRef.current = niveauxQuery;
    sallesQueryRef.current = sallesQuery;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const withRequestState = useCallback(async <T,>(request: () => Promise<T>) => {
        setIsLoading(true);
        try {
            const result = await request();
            setError(null);
            return result;
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Une erreur inattendue est survenue.');
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadClasses = useCallback(async () => {
        const response = await fetchClassesPage(classesQueryRef.current);
        setClasses(response.items);
        setClassesMeta(response.meta);
    }, []);

    const loadFilieres = useCallback(async () => {
        const response = await fetchFilieresPage(filieresQueryRef.current);
        setFilieres(response.items);
        setFilieresMeta(response.meta);
    }, []);

    const loadModules = useCallback(async () => {
        const response = await fetchModulesPage(modulesQueryRef.current);
        setModules(response.items);
        setModulesMeta(response.meta);
    }, []);

    const loadNiveaux = useCallback(async () => {
        const response = await fetchNiveauxPage(niveauxQueryRef.current);
        setNiveaux(response.items);
        setNiveauxMeta(response.meta);
    }, []);

    const loadSalles = useCallback(async () => {
        const response = await fetchSallesPage(sallesQueryRef.current);
        setSalles(response.items);
        setSallesMeta(response.meta);
    }, []);

    useEffect(() => {
        void withRequestState(async () => {
            if (activeTab === 'classes') {
                await Promise.all([loadClasses(), loadFilieres(), loadNiveaux()]);
                return;
            }
            if (activeTab === 'modules') {
                await Promise.all([loadModules(), loadFilieres()]);
                return;
            }
            if (activeTab === 'filieres') {
                await loadFilieres();
                return;
            }
            if (activeTab === 'niveaux') {
                await loadNiveaux();
                return;
            }
            if (activeTab === 'salles') {
                await loadSalles();
            }
        });
    }, [activeTab, withRequestState, loadClasses, loadFilieres, loadModules, loadNiveaux, loadSalles]);

    // Separate effect to handle query changes - reloads data when query changes
    // This uses refs to avoid infinite loops
    const isInitialMount = useRef(true);
    const previousModulesQuery = useRef(modulesQuery);
    const previousFilieresQuery = useRef(filieresQuery);
    const previousClassesQuery = useRef(classesQuery);
    const previousNiveauxQuery = useRef(niveauxQuery);
    const previousSallesQuery = useRef(sallesQuery);

    useEffect(() => {
        // Skip initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Check if modules query changed
        if (activeTab === 'modules') {
            const queryChanged = JSON.stringify(previousModulesQuery.current) !== JSON.stringify(modulesQuery) ||
                                JSON.stringify(previousFilieresQuery.current) !== JSON.stringify(filieresQuery);
            if (queryChanged) {
                previousModulesQuery.current = modulesQuery;
                previousFilieresQuery.current = filieresQuery;
                void withRequestState(async () => {
                    await Promise.all([loadModules(), loadFilieres()]);
                });
            }
        }

        // Check if classes query changed
        if (activeTab === 'classes') {
            const queryChanged = JSON.stringify(previousClassesQuery.current) !== JSON.stringify(classesQuery) ||
                                JSON.stringify(previousFilieresQuery.current) !== JSON.stringify(filieresQuery) ||
                                JSON.stringify(previousNiveauxQuery.current) !== JSON.stringify(niveauxQuery);
            if (queryChanged) {
                previousClassesQuery.current = classesQuery;
                previousFilieresQuery.current = filieresQuery;
                previousNiveauxQuery.current = niveauxQuery;
                void withRequestState(async () => {
                    await Promise.all([loadClasses(), loadFilieres(), loadNiveaux()]);
                });
            }
        }

        // Check if filieres query changed
        if (activeTab === 'filieres') {
            const queryChanged = JSON.stringify(previousFilieresQuery.current) !== JSON.stringify(filieresQuery);
            if (queryChanged) {
                previousFilieresQuery.current = filieresQuery;
                void withRequestState(async () => {
                    await loadFilieres();
                });
            }
        }

        // Check if niveaux query changed
        if (activeTab === 'niveaux') {
            const queryChanged = JSON.stringify(previousNiveauxQuery.current) !== JSON.stringify(niveauxQuery);
            if (queryChanged) {
                previousNiveauxQuery.current = niveauxQuery;
                void withRequestState(async () => {
                    await loadNiveaux();
                });
            }
        }

        // Check if salles query changed
        if (activeTab === 'salles') {
            const queryChanged = JSON.stringify(previousSallesQuery.current) !== JSON.stringify(sallesQuery);
            if (queryChanged) {
                previousSallesQuery.current = sallesQuery;
                void withRequestState(async () => {
                    await loadSalles();
                });
            }
        }
    }, [activeTab, modulesQuery, filieresQuery, classesQuery, niveauxQuery, sallesQuery, withRequestState, loadClasses, loadFilieres, loadModules, loadNiveaux, loadSalles]);

    const reloadAll = useCallback(async () => {
        await withRequestState(async () => {
            await Promise.all([loadClasses(), loadFilieres(), loadModules(), loadNiveaux(), loadSalles()]);
        });
    }, [loadClasses, loadFilieres, loadModules, loadNiveaux, loadSalles, withRequestState]);

    const refreshAfter = useCallback(async <T,>(operation: () => Promise<T>, refreshers: Array<() => Promise<void>>) => {
        return withRequestState(async () => {
            const result = await operation();
            await Promise.all(refreshers.map((refresher) => refresher()));
            return result;
        });
    }, [withRequestState]);

    const createClasseAction = useCallback(
        async (payload: ClassePayload) => refreshAfter(() => createClasse(payload), [loadClasses]),
        [refreshAfter, loadClasses]
    );

    const updateClasseAction = useCallback(
        async (id: UUID, payload: ClassePayload) => refreshAfter(() => updateClasse(id, payload), [loadClasses]),
        [refreshAfter, loadClasses]
    );

    const deleteClasseAction = useCallback(
        async (id: UUID) => refreshAfter(() => deleteClasse(id), [loadClasses]),
        [refreshAfter, loadClasses]
    );

    const createFiliereAction = useCallback(
        async (libelle: string) => refreshAfter(() => createFiliere({ libelle }), [loadFilieres]),
        [refreshAfter, loadFilieres]
    );

    const updateFiliereAction = useCallback(
        async (id: UUID, libelle: string) => refreshAfter(() => updateFiliere(id, { libelle }), [loadFilieres, loadModules, loadClasses]),
        [refreshAfter, loadFilieres, loadModules, loadClasses]
    );

    const deleteFiliereAction = useCallback(
        async (id: UUID) => refreshAfter(() => deleteFiliere(id), [loadFilieres, loadModules, loadClasses]),
        [refreshAfter, loadFilieres, loadModules, loadClasses]
    );

    const createModuleAction = useCallback(
        async (payload: ModulePayload) => refreshAfter(() => createModule(payload), [loadModules, loadFilieres]),
        [refreshAfter, loadModules, loadFilieres]
    );

    const updateModuleAction = useCallback(
        async (id: UUID, payload: ModulePayload) => refreshAfter(() => updateModule(id, payload), [loadModules, loadFilieres]),
        [refreshAfter, loadModules, loadFilieres]
    );

    const deleteModuleAction = useCallback(
        async (id: UUID) => refreshAfter(() => deleteModule(id), [loadModules, loadFilieres]),
        [refreshAfter, loadModules, loadFilieres]
    );

    const createNiveauAction = useCallback(
        async (libelle: string) => refreshAfter(() => createNiveau({ libelle }), [loadNiveaux, loadClasses]),
        [refreshAfter, loadNiveaux, loadClasses]
    );

    const updateNiveauAction = useCallback(
        async (id: UUID, libelle: string) => refreshAfter(() => updateNiveau(id, { libelle }), [loadNiveaux, loadClasses]),
        [refreshAfter, loadNiveaux, loadClasses]
    );

    const deleteNiveauAction = useCallback(
        async (id: UUID) => refreshAfter(() => deleteNiveau(id), [loadNiveaux, loadClasses]),
        [refreshAfter, loadNiveaux, loadClasses]
    );

    const createSalleAction = useCallback(
        async (payload: SallePayload) => refreshAfter(() => createSalle(payload), [loadSalles]),
        [refreshAfter, loadSalles]
    );

    const updateSalleAction = useCallback(
        async (id: UUID, payload: SallePayload) => refreshAfter(() => updateSalle(id, payload), [loadSalles]),
        [refreshAfter, loadSalles]
    );

    const deleteSalleAction = useCallback(
        async (id: UUID) => refreshAfter(() => deleteSalle(id), [loadSalles]),
        [refreshAfter, loadSalles]
    );

    const filiereOptions = useMemo(
        () => filieres.map(filiere => ({ id: filiere.id, libelle: filiere.libelle })),
        [filieres]
    );

    const niveauOptions = useMemo(
        () => niveaux.map(niveau => ({ id: niveau.id, libelle: niveau.libelle })),
        [niveaux]
    );

    return {
        classes,
        filieres,
        modules,
        niveaux,
        salles,
        meta: {
            classes: classesMeta,
            filieres: filieresMeta,
            modules: modulesMeta,
            niveaux: niveauxMeta,
            salles: sallesMeta
        },
        query: {
            classes: classesQuery,
            filieres: filieresQuery,
            modules: modulesQuery,
            niveaux: niveauxQuery,
            salles: sallesQuery
        },
        setQuery: {
            classes: setClassesQuery,
            filieres: setFilieresQuery,
            modules: setModulesQuery,
            niveaux: setNiveauxQuery,
            salles: setSallesQuery
        },
        isLoading,
        error,
        reload: reloadAll,
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
