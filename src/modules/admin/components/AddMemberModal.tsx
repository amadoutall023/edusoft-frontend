'use client';

import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { createAdminMember } from '../services/adminService';
import { ApiError } from '@/shared/errors/ApiError';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Rôles disponibles pour les membres administratifs
// Note: Un admin ne peut pas créer un autre admin (ROLE_ADMIN)
// Roles autorisés: Attaché de Classe, Responsable Pédagogique, Directeur/Directrice
const roleOptions = [
    { value: 'ROLE_ATTACHE_CLASSE', label: 'Attaché de classe' },
    { value: 'ROLE_RP', label: 'Responsable pédagogique' },
    { value: 'ROLE_DIRECTRICE', label: 'Directeur/Directrice' }
];

export default function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        username: '',
        password: '',
        roleName: 'ROLE_ATTACHE_CLASSE' as string,
        poste: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Log pour débogage
            console.log('Données envoyées:', JSON.stringify(formData, null, 2));

            // Appeler l'API pour créer le membre
            await createAdminMember(formData);

            onSuccess();
            onClose();
            // Réinitialiser le formulaire
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                telephone: '',
                username: '',
                password: '',
                roleName: 'ROLE_ATTACHE_CLASSE',
                poste: ''
            });
        } catch (err) {
            console.error('Erreur complète:', err);
            if (err instanceof ApiError) {
                // Essayer d'extraire le message d'erreur du backend
                const errorDetails = err.details as { message?: string; messages?: string[] };
                if (errorDetails?.messages) {
                    setError(errorDetails.messages.join(', '));
                } else if (errorDetails?.message) {
                    setError(errorDetails.message);
                } else {
                    setError(err.message);
                }
            } else {
                setError('Erreur lors de la création du membre. Veuillez réessayer.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999999,
            backdropFilter: 'blur(4px)'
        }}
            onClick={onClose}
        >
            <div style={{
                background: 'white',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1a202c',
                        margin: 0
                    }}>Ajouter un membre</h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#f1f5f9',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <X size={20} color="#64748b" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '10px',
                            color: '#dc2626',
                            fontSize: '14px',
                            marginBottom: '20px'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Prénom */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Prénom *</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                            onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Nom */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Nom *</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                            onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                            onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Téléphone */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Téléphone</label>
                        <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                            onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Nom d'utilisateur */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Nom d'utilisateur *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                            onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Mot de passe */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Mot de passe *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                            onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Rôle */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Rôle *</label>
                        <select
                            name="roleName"
                            value={formData.roleName}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box',
                                cursor: 'pointer',
                                background: 'white'
                            }}
                            onFocus={(e: any) => e.target.style.borderColor = '#5B8DEF'}
                            onBlur={(e: any) => e.target.style.borderColor = '#e2e8f0'}
                        >
                            {roleOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Boutons */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '12px 20px',
                                background: 'white',
                                color: '#64748b',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isLoading && <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
                            <Plus size={18} />
                            Ajouter
                        </button>
                    </div>
                </form>

                <style jsx>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
