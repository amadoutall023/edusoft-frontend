'use client';

import React, { useEffect, useState } from 'react';
import TableAdmin from './TableAdmin';
import { MembreAdministration } from '../types';
import { fetchAdminMembers } from '../services/adminService';
import { UserDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';

const roleLabels: Record<string, string> = {
    ROLE_SUPER_ADMIN: 'Super admin',
    ROLE_ADMIN: 'Administrateur',
    ROLE_ATTACHE_CLASSE: 'Attaché de classe',
    ROLE_RP: 'Responsable pédagogique',
    ROLE_DIRECTRICE: 'Directrice'
};

const mapMember = (user: UserDto): MembreAdministration => ({
    id: user.id,
    prenom: user.firstName,
    nom: user.lastName,
    email: user.email,
    telephone: user.telephone ?? undefined,
    role: user.roles?.map(role => roleLabels[role.name] ?? role.name.replace('ROLE_', '')).join(', ') || 'Utilisateur',
    login: user.username,
    schoolName: user.ecole?.nom ?? null
});

export default function AdministrationContent() {
    const [members, setMembers] = useState<MembreAdministration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMembers = async () => {
            try {
                setIsLoading(true);
                const response = await fetchAdminMembers({ size: 200 });
                const payload = response.data ?? [];
                setMembers(payload.map(mapMember));
                setError(null);
            } catch (err) {
                if (err instanceof ApiError) {
                    setError(err.message);
                } else {
                    setError('Impossible de charger les membres.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadMembers();
    }, []);

    return (
        <>
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
                }}>Membres de l'administration</h1>
            </div>

            {isLoading && (
                <div style={{ padding: '24px 40px', color: '#64748b' }}>
                    Chargement des membres...
                </div>
            )}

            {error && !isLoading && (
                <div style={{ padding: '24px 40px', color: '#dc2626' }}>
                    {error}
                </div>
            )}

            {!isLoading && !error && (
                <TableAdmin data={members} />
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
