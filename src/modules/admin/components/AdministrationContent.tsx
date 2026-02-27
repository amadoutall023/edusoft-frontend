'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import TableAdmin from './TableAdmin';
import AddMemberModal from './AddMemberModal';
import { MembreAdministration } from '../types';
import { fetchAdminMembers } from '../services/adminService';
import { UserDto } from '@/shared/api/types';
import { ApiError } from '@/shared/errors/ApiError';

const roleLabels: Record<string, string> = {
    ROLE_SUPER_ADMIN: 'Super admin',
    ROLE_ADMIN: 'Administrateur',
    ROLE_ATTACHE_CLASSE: 'Attaché de classe',
    ROLE_RP: 'Responsable pédagogique',
    ROLE_DIRECTRICE: 'Directrice',
    ROLE_PROFESSOR: 'Professeur',
    ROLE_STUDENT: 'Étudiant'
};

// Rôles à afficher dans la liste administration
const ALLOWED_ROLES = [
    'ROLE_ADMIN',
    'ROLE_DIRECTRICE',
    'ROLE_RP',
    'ROLE_ATTACHE_CLASSE'
];

// Vérifie si l'utilisateur est un membre du personnel administratif
const isAdminMember = (user: UserDto): boolean => {
    const userRoles = user.roles?.map(r => r.name) ?? [];
    return userRoles.some(role => ALLOWED_ROLES.includes(role));
};

const mapMember = (user: UserDto): MembreAdministration | null => {
    // Ne garder que les membres administratifs
    if (!isAdminMember(user)) {
        return null;
    }

    return {
        id: user.id,
        prenom: user.firstName,
        nom: user.lastName,
        email: user.email,
        telephone: user.telephone ?? undefined,
        role: user.roles?.map(role => roleLabels[role.name] ?? role.name.replace('ROLE_', '')).join(', ') || 'Utilisateur',
        login: user.username,
        schoolName: user.ecole?.nom ?? null,
        qrToken: user.qrToken ?? null
    };
};

export default function AdministrationContent() {
    const [members, setMembers] = useState<MembreAdministration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddMember = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalSuccess = () => {
        // Recharger les membres après l'ajout
        loadMembers();
    };

    const loadMembers = async () => {
        try {
            setIsLoading(true);
            const response = await fetchAdminMembers({ size: 200 });
            const payload = response.data ?? [];
            setMembers(payload.map(mapMember).filter((m): m is MembreAdministration => m !== null));
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

    useEffect(() => {
        loadMembers();
    }, []);

    return (
        <>
            <div className="page-title" style={{
                padding: '32px 40px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#1a202c',
                        margin: 0,
                        letterSpacing: '-0.5px'
                    }}>Administration</h1>
                    <p style={{ marginTop: '8px', color: '#64748b', fontSize: '14px' }}>Administrateurs, Directrices, Responsables pédagogiques et Attachés de classe</p>
                </div>
                <button
                    onClick={handleAddMember}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(91,141,239,0.3)'
                    }}
                    onMouseEnter={(e: any) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(91,141,239,0.4)';
                    }}
                    onMouseLeave={(e: any) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(91,141,239,0.3)';
                    }}
                >
                    <Plus size={18} />
                    Ajouter un membre
                </button>
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
                <>
                    <TableAdmin data={members} />
                    <AddMemberModal
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        onSuccess={handleModalSuccess}
                    />
                </>
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

