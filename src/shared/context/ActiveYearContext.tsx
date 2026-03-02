'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActiveYearResponse } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';
import { getActiveYear, getAvailableYears, setActiveYear } from '@/shared/api/activeYearService';
import { ACTIVE_YEAR_CHANGED_EVENT } from '@/shared/api/activeYearStorage';

interface ActiveYearContextShape {
    activeYear: ActiveYearResponse | null;
    availableYears: ActiveYearResponse[];
    selectedYearId: string;
    activeStartYear: number | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    setActiveYearById: (yearId: string) => Promise<void>;
}

const ActiveYearContext = createContext<ActiveYearContextShape | undefined>(undefined);

function extractStartYearFromLabel(label?: string | null): number | null {
    if (!label) return null;
    const match = label.match(/\b(19|20)\d{2}\b/);
    return match ? Number(match[0]) : null;
}

export function extractActiveStartYear(year: ActiveYearResponse | null): number | null {
    if (!year) return null;
    const fromLabel = extractStartYearFromLabel(year.annee);
    if (fromLabel) return fromLabel;
    if (year.dateDebut) {
        const parsed = new Date(year.dateDebut);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.getFullYear();
        }
    }
    return null;
}

export function ActiveYearProvider({ children }: { children: React.ReactNode }) {
    const [activeYear, setActiveYearState] = useState<ActiveYearResponse | null>(null);
    const [availableYears, setAvailableYears] = useState<ActiveYearResponse[]>([]);
    const [selectedYearId, setSelectedYearId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            const [available, active] = await Promise.all([
                getAvailableYears(),
                getActiveYear()
            ]);
            setAvailableYears(available);
            setActiveYearState(active);
            if (active?.id) {
                setSelectedYearId(active.id);
            } else if (available[0]?.id) {
                setSelectedYearId(available[0].id);
            } else {
                setSelectedYearId('');
            }
            setError(null);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Années scolaires indisponibles');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setActiveYearById = useCallback(async (yearId: string) => {
        if (!yearId) return;
        try {
            setIsSaving(true);
            const updated = await setActiveYear(yearId);
            if (updated?.id) {
                setActiveYearState(updated);
                setSelectedYearId(updated.id);
            } else {
                setSelectedYearId(yearId);
            }
            setError(null);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Impossible de définir l’année active');
            }
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const onExternalYearChange = () => {
            void refresh();
        };
        window.addEventListener(ACTIVE_YEAR_CHANGED_EVENT, onExternalYearChange);
        return () => window.removeEventListener(ACTIVE_YEAR_CHANGED_EVENT, onExternalYearChange);
    }, [refresh]);

    const value = useMemo<ActiveYearContextShape>(() => ({
        activeYear,
        availableYears,
        selectedYearId,
        activeStartYear: extractActiveStartYear(activeYear),
        isLoading,
        isSaving,
        error,
        refresh,
        setActiveYearById
    }), [activeYear, availableYears, selectedYearId, isLoading, isSaving, error, refresh, setActiveYearById]);

    return (
        <ActiveYearContext.Provider value={value}>
            {children}
        </ActiveYearContext.Provider>
    );
}

export function useActiveYear() {
    const context = useContext(ActiveYearContext);
    if (context === undefined) {
        throw new Error('useActiveYear must be used within an ActiveYearProvider');
    }
    return context;
}
