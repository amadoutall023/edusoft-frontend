'use client';

import React, { useEffect, useState } from 'react';
import AttacheProfesseurTable from './AttacheProfesseurTable';
import { ProfessorData } from '../types';
import { fetchProfessors } from '../services/professorService';
import { ProfessorResponseDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';

const mapProfessor = (prof: ProfessorResponseDto): ProfessorData => ({
    id: prof.professorId,
    professorId: prof.professorId,
    userId: prof.userId,
    prenom: prof.firstName,
    nom: prof.lastName,
    email: prof.email,
    username: prof.username,
    telephone: prof.telephone ?? undefined,
    specialite: prof.specialite ?? undefined,
    grade: prof.grade ?? undefined,
    schoolId: prof.schoolId ?? undefined,
    schoolName: prof.schoolName ?? undefined,
    roles: Array.from(prof.roles || []),
    modules: prof.modules?.map(m => ({ id: m.id, libelle: m.libelle })) || []
});

export default function AttacheProfesseurContent() {
    const [professeurs, setProfesseurs] = useState<ProfessorData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfessors = async () => {
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

    useEffect(() => {
        void loadProfessors();
    }, []);

    return (
        <>
            {/* Page Title */}
            <div className="page-title" style={{
                padding: '32px 40px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
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
                <AttacheProfesseurTable data={professeurs} />
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    .page-title {
                        padding: 20px !important;
                    }
                    .page-title h1 {
                        fontSize: 22px !important;
                    }
                }
            `}</style>
        </>
    );
}
