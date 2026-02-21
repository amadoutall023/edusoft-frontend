'use client';

import React, { useEffect, useState } from 'react';
import ProfesseursTable from './ProfesseursTable';
import { Professeur } from '../types';
import { fetchProfessors } from '../services/professorService';
import { ProfessorResponseDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';

const mapProfessor = (prof: ProfessorResponseDto): Professeur => ({
    id: prof.professorId,
    prenom: prof.firstName,
    nom: prof.lastName,
    email: prof.email,
    username: prof.username,
    numero: prof.telephone ?? null,
    specialite: prof.specialite ?? null,
    grade: prof.grade ?? null,
    modules: prof.modules?.map(module => module.libelle) ?? []
});

export default function ProfesseursContent() {
    const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const response = await fetchProfessors();
                setProfesseurs(response.map(mapProfessor));
                setError(null);
            } catch (err) {
                console.error('Unable to load professors', err);
                setError(err instanceof ApiError ? err.message : 'Impossible de charger les professeurs.');
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, []);

    return (
        <>
            {/* Page Title */}
            <div className="page-title" style={{
                padding: '32px 40px 24px',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a202c',
                    margin: 0,
                    letterSpacing: '-0.5px'
                }}>Liste des Professeurs</h1>
            </div>

            {isLoading && (
                <div style={{ padding: '24px 40px', color: '#64748b' }}>
                    Chargement des professeurs...
                </div>
            )}

            {error && !isLoading && (
                <div style={{ padding: '24px 40px', color: '#dc2626' }}>
                    {error}
                </div>
            )}

            {!isLoading && !error && (
                <ProfesseursTable data={professeurs} />
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    .page-title {
                        padding: 20px !important;
                    }
                    .page-title h1 {
                        font-size: 22px !important;
                    }
                }
            `}</style>
        </>
    );
}
