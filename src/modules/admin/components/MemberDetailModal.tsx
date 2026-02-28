'use client';

import React from 'react';
import { X, QrCode, Mail, Phone, User, Building } from 'lucide-react';
import { MembreAdministration } from '../types';

interface MemberDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: MembreAdministration | null;
}

export default function MemberDetailModal({ isOpen, onClose, member }: MemberDetailModalProps) {
    if (!isOpen || !member) return null;

    // Generate QR code image URL using a public API
    const qrCodeUrl = member.qrToken
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(member.qrToken)}`
        : null;

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
                maxWidth: '450px',
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
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                    borderRadius: '20px 20px 0 0',
                    color: 'white'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        margin: 0
                    }}>Détails du membre</h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <X size={20} color="white" />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {/* Profile Section */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '24px',
                        paddingBottom: '24px',
                        borderBottom: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            fontWeight: '700',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(91, 141, 239, 0.4)'
                        }}>
                            {member.prenom.charAt(0)}{member.nom.charAt(0)}
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#1a202c',
                                margin: 0
                            }}>{member.prenom} {member.nom}</h3>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                background: '#E3F2FD',
                                color: '#5B8DEF',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginTop: '4px'
                            }}>{member.role}</span>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div style={{ marginBottom: '24px' }}>
                        {/* Email */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                            padding: '12px',
                            background: '#f8fafc',
                            borderRadius: '10px'
                        }}>
                            <Mail size={18} color="#5B8DEF" />
                            <div>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Email</p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#1a202c', fontWeight: '500' }}>{member.email}</p>
                            </div>
                        </div>

                        {/* Téléphone */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                            padding: '12px',
                            background: '#f8fafc',
                            borderRadius: '10px'
                        }}>
                            <Phone size={18} color="#5B8DEF" />
                            <div>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Téléphone</p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#1a202c', fontWeight: '500' }}>{member.telephone || '—'}</p>
                            </div>
                        </div>

                        {/* Login */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                            padding: '12px',
                            background: '#f8fafc',
                            borderRadius: '10px'
                        }}>
                            <User size={18} color="#5B8DEF" />
                            <div>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Nom d'utilisateur</p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#1a202c', fontWeight: '500' }}>{member.login}</p>
                            </div>
                        </div>

                        {/* École */}
                        {member.schoolName && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                background: '#f8fafc',
                                borderRadius: '10px'
                            }}>
                                <Building size={18} color="#5B8DEF" />
                                <div>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>École</p>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#1a202c', fontWeight: '500' }}>{member.schoolName}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* QR Code Section */}
                    {member.qrToken && (
                        <div style={{
                            background: '#f8fafc',
                            borderRadius: '16px',
                            padding: '24px',
                            textAlign: 'center',
                            border: '2px dashed #5B8DEF'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginBottom: '16px',
                                color: '#5B8DEF',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>
                                <QrCode size={20} />
                                Code QR d'identification
                            </div>

                            <div style={{
                                background: 'white',
                                padding: '16px',
                                borderRadius: '12px',
                                display: 'inline-block',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}>
                                <img
                                    src={qrCodeUrl || ''}
                                    alt="QR Code"
                                    width="180"
                                    height="180"
                                    style={{ display: 'block' }}
                                />
                            </div>

                            <p style={{
                                marginTop: '16px',
                                fontSize: '11px',
                                color: '#64748b',
                                maxWidth: '250px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                wordBreak: 'break-all'
                            }}>
                                {member.qrToken}
                            </p>
                        </div>
                    )}

                    {!member.qrToken && (
                        <div style={{
                            background: '#fef3c7',
                            borderRadius: '10px',
                            padding: '16px',
                            textAlign: 'center',
                            color: '#92400e',
                            fontSize: '14px'
                        }}>
                            QR Code non disponible pour ce membre
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 24px',
                            background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
