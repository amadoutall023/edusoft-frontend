'use client';

import React, { useState, useEffect } from 'react';
import {
  getPresencesEtudiantsByType,
  getPresenceProfesseurByType,
  hemargerProfesseur,
  initialiserPresencesEtudiants,
  mettreAJourPresenceEtudiant,
  mettreAJourPresencesBatch,
  HemargeResponseDto,
  HemargeType,
  PresenceStatus
} from '../services/presenceService';
import { tokenStorage } from '@/shared/api/tokenStorage';

interface EmargementPanelProps {
  sessionId: string;
  professorId: string;
  onClose: () => void;
  sessionDate?: string;
  sessionHeureDebut?: string;
}

const HEMARGEMENT_TYPES: { value: HemargeType; label: string }[] = [
  { value: 'DEBUT', label: 'Début' },
  { value: 'MILIEU', label: 'Milieu' },
  { value: 'FIN', label: 'Fin' }
];

const STATUT_OPTIONS: { value: PresenceStatus; label: string; bgColor: string; textColor: string }[] = [
  { value: 'PRESENT', label: 'Présent', bgColor: '#d1fae5', textColor: '#065f46' },
  { value: 'ABSENT', label: 'Absent', bgColor: '#fee2e2', textColor: '#991b1b' },
  { value: 'RETARD', label: 'Retard', bgColor: '#fef3c7', textColor: '#92400e' },
  { value: 'EXCUSE', label: 'Excusé', bgColor: '#dbeafe', textColor: '#1e40af' }
];

export default function EmargementPanel({
  sessionId,
  professorId,
  onClose,
  sessionDate,
  sessionHeureDebut
}: EmargementPanelProps) {
  const [hemargeType, setHemargeType] = useState<HemargeType>('DEBUT');
  const [presences, setPresences] = useState<HemargeResponseDto[]>([]);
  const [professorPresence, setProfessorPresence] = useState<HemargeResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    loadPresences();
  }, [sessionId, hemargeType]);

  const loadPresences = async () => {
    setLoading(true);
    try {
      const [studentPresences, profPresence] = await Promise.all([
        getPresencesEtudiantsByType(sessionId, hemargeType),
        getPresenceProfesseurByType(sessionId, hemargeType)
      ]);
      setPresences(studentPresences);
      setProfessorPresence(profPresence);
    } catch (error) {
      console.error('Erreur lors du chargement des présences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialiserPresences = async () => {
    setInitializing(true);
    try {
      const newPresences = await initialiserPresencesEtudiants(sessionId, hemargeType);
      setPresences(newPresences);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      alert('Impossible d\'initialiser les présences. Vérifiez que la session a une classe associée.');
    } finally {
      setInitializing(false);
    }
  };

  const handleHemargerProfesseur = async () => {
    if (!professorId) {
      alert('Aucun professeur assigné à cette session');
      return;
    }
    setSaving(true);
    try {
      const presence = await hemargerProfesseur(sessionId, professorId, hemargeType);
      setProfessorPresence(presence);
    } catch (error) {
      console.error('Erreur lors de l\'émargement du professeur:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatutChange = async (studentId: string, nouveauStatut: PresenceStatus) => {
    try {
      const updated = await mettreAJourPresenceEtudiant(sessionId, studentId, hemargeType, nouveauStatut);
      setPresences(prev => prev.map(p => p.studentId === studentId ? updated : p));
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleMarquerTousPresents = async () => {
    setSaving(true);
    try {
      const studentIds = presences.filter(p => p.status === 'ABSENT').map(p => p.studentId!);
      if (studentIds.length > 0) {
        const updated = await mettreAJourPresencesBatch(sessionId, hemargeType, studentIds, 'PRESENT');
        setPresences(updated);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour en masse:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleMarquerTousAbsents = async () => {
    setSaving(true);
    try {
      const studentIds = presences.filter(p => p.status === 'PRESENT').map(p => p.studentId!);
      if (studentIds.length > 0) {
        const updated = await mettreAJourPresencesBatch(sessionId, hemargeType, studentIds, 'ABSENT');
        setPresences(updated);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour en masse:', error);
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    presents: presences.filter(p => p.status === 'PRESENT').length,
    absents: presences.filter(p => p.status === 'ABSENT').length,
    retards: presences.filter(p => p.status === 'RETARD').length,
    excuses: presences.filter(p => p.status === 'EXCUSE').length,
    total: presences.length
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginTop: '16px',
    overflow: 'hidden'
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '4px'
  };

  const selectStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: 'white',
    cursor: 'pointer'
  };

  const buttonPrimaryStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const buttonSecondaryStyle: React.CSSProperties = {
    ...buttonPrimaryStyle,
    backgroundColor: '#e2e8f0',
    color: '#475569'
  };

  const badgeStyle = (color: string, bgColor: string): React.CSSProperties => ({
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: bgColor,
    color: color
  });

  return (
    <div style={containerStyle}>
      <style>{`
        @media (max-width: 768px) {
          .emargement-stats {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .emargement-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start !important;
          }
          .emargement-controls {
            flex-direction: column;
            align-items: stretch !important;
          }
          .emargement-actions {
            flex-wrap: wrap;
          }
          /* Masquer le tableau sur mobile et afficher les cartes */
          .emargement-table {
            display: none !important;
          }
          .emargement-cards {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          /* Masquer les cartes sur desktop et afficher le tableau */
          .emargement-cards {
            display: none !important;
          }
          .emargement-table {
            display: block !important;
          }
        }
        @media (max-width: 480px) {
          .emargement-stats {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
      {/* Header */}
      <div className="emargement-header" style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px' }}>📋</span>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>Émargement</div>
            {sessionDate && <div style={{ fontSize: '12px', opacity: 0.8 }}>{sessionDate} {sessionHeureDebut && `• ${sessionHeureDebut}`}</div>}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✕ Fermer
        </button>
      </div>

      {/* Controls */}
      <div className="emargement-controls" style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        backgroundColor: 'white'
      }}>
        <div>
          <div style={labelStyle}>Type d'émargement</div>
          <select
            value={hemargeType}
            onChange={(e) => setHemargeType(e.target.value as HemargeType)}
            style={selectStyle}
          >
            {HEMARGEMENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}></div>

        {/* Professor presence */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Prof:</span>
          {professorPresence ? (
            <span style={badgeStyle('#065f46', '#d1fae5')}>
              ✓ Émargé
            </span>
          ) : (
            <button
              onClick={handleHemargerProfesseur}
              disabled={saving}
              style={{
                ...buttonPrimaryStyle,
                backgroundColor: '#2563eb',
                color: 'white',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? '...' : 'Émarger'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid #e2e8f0',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : presences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
            <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
              Aucune présence initialisée pour ce type d'émargement
            </p>
            <button
              onClick={handleInitialiserPresences}
              disabled={initializing}
              style={{
                ...buttonPrimaryStyle,
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '8px 16px',
                opacity: initializing ? 0.6 : 1
              }}
            >
              {initializing ? 'Initialisation...' : 'Initialiser les présences'}
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="emargement-stats" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ backgroundColor: '#d1fae5', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#065f46' }}>{stats.presents}</div>
                <div style={{ fontSize: '11px', color: '#065f46' }}>Présents</div>
              </div>
              <div style={{ backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#991b1b' }}>{stats.absents}</div>
                <div style={{ fontSize: '11px', color: '#991b1b' }}>Absents</div>
              </div>
              <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#92400e' }}>{stats.retards}</div>
                <div style={{ fontSize: '11px', color: '#92400e' }}>Retards</div>
              </div>
              <div style={{ backgroundColor: '#dbeafe', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af' }}>{stats.excuses}</div>
                <div style={{ fontSize: '11px', color: '#1e40af' }}>Excusés</div>
              </div>
              <div style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#475569' }}>{stats.total}</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>Total</div>
              </div>
            </div>

            {/* Actions */}
            <div className="emargement-actions" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={handleMarquerTousPresents}
                disabled={saving || stats.absents === 0}
                style={{
                  ...buttonPrimaryStyle,
                  backgroundColor: '#10b981',
                  color: 'white',
                  opacity: saving || stats.absents === 0 ? 0.5 : 1
                }}
              >
                Tous présents
              </button>
              <button
                onClick={handleMarquerTousAbsents}
                disabled={saving || stats.presents === 0}
                style={{
                  ...buttonPrimaryStyle,
                  backgroundColor: '#ef4444',
                  color: 'white',
                  opacity: saving || stats.presents === 0 ? 0.5 : 1
                }}
              >
                Tous absents
              </button>
              <button
                onClick={loadPresences}
                style={buttonSecondaryStyle}
              >
                ↻ Actualiser
              </button>
            </div>

            {/* Table - Desktop */}
            <div className="emargement-table" style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ ...labelStyle, padding: '10px 12px', textAlign: 'left' }}>Matricule</th>
                    <th style={{ ...labelStyle, padding: '10px 12px', textAlign: 'left' }}>Nom</th>
                    <th style={{ ...labelStyle, padding: '10px 12px', textAlign: 'left' }}>Prénom</th>
                    <th style={{ ...labelStyle, padding: '10px 12px', textAlign: 'left' }}>Statut</th>
                    <th style={{ ...labelStyle, padding: '10px 12px', textAlign: 'left' }}>Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {presences.map((presence) => {
                    const statOption = STATUT_OPTIONS.find(s => s.value === presence.status);
                    return (
                      <tr key={presence.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontSize: '13px', color: '#64748b' }}>{presence.studentMatricule}</td>
                        <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>{presence.studentNom}</td>
                        <td style={{ padding: '10px 12px', fontSize: '13px', color: '#1e293b' }}>{presence.studentPrenom}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <select
                            value={presence.status}
                            onChange={(e) => handleStatutChange(presence.studentId!, e.target.value as PresenceStatus)}
                            style={{
                              ...selectStyle,
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: statOption?.bgColor || '#f1f5f9',
                              color: statOption?.textColor || '#475569',
                              border: 'none',
                              fontWeight: '500'
                            }}
                          >
                            {STATUT_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#94a3b8' }}>
                          {presence.hemargeAt ? new Date(presence.hemargeAt).toLocaleTimeString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards - Mobile */}
            <div className="emargement-cards" style={{
              display: 'none',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {presences.map((presence) => {
                const statOption = STATUT_OPTIONS.find(s => s.value === presence.status);
                return (
                  <div
                    key={presence.id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    {/* Header with name */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#1e293b',
                          marginBottom: '2px'
                        }}>
                          {presence.studentPrenom} {presence.studentNom}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          Mat: {presence.studentMatricule}
                        </div>
                      </div>
                      {/* Status badge */}
                      <select
                        value={presence.status}
                        onChange={(e) => handleStatutChange(presence.studentId!, e.target.value as PresenceStatus)}
                        style={{
                          ...selectStyle,
                          padding: '6px 10px',
                          fontSize: '12px',
                          backgroundColor: statOption?.bgColor || '#f1f5f9',
                          color: statOption?.textColor || '#475569',
                          border: 'none',
                          fontWeight: '600',
                          borderRadius: '20px'
                        }}
                      >
                        {STATUT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Time info */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: '#94a3b8'
                    }}>
                      <span style={{ marginRight: '4px' }}>🕐</span>
                      {presence.hemargeAt ? new Date(presence.hemargeAt).toLocaleTimeString() : 'Non émargé'}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
