'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';
import { fetchStudentsByClasse, fetchClasseAbsenceStats, AbsenceStats } from '@/modules/etudiant/services/studentService';
import { StudentResponseDto } from '@/shared/api/types';
import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse } from '@/shared/api/types';
import { tokenStorage } from '@/shared/api/tokenStorage';

interface PresenceStats {
    totalAbsences: number;
    justifiedAbsences: number;
    unjustifiedAbsences: number;
}

interface StudentWithAbsences extends StudentResponseDto {
    absences: PresenceStats;
    isResponsable: boolean;
}

export default function ClasseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const classeId = params.id as string;

    const [students, setStudents] = useState<StudentWithAbsences[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [classeName, setClasseName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchAbsences = async (studentId: string): Promise<PresenceStats> => {
        try {
            const response = await fetchClasseAbsenceStats(classeId);
            const studentStats = response.find(s => s.studentId === studentId);
            if (studentStats) {
                return {
                    totalAbsences: studentStats.totalAbsences,
                    justifiedAbsences: studentStats.justifiedAbsences,
                    unjustifiedAbsences: studentStats.unjustifiedAbsences
                };
            }
        } catch (error) {
            console.error('Error fetching absences:', error);
        }
        return {
            totalAbsences: 0,
            justifiedAbsences: 0,
            unjustifiedAbsences: 0
        };
    };

    const loadData = useCallback(async () => {
        if (!classeId) return;

        try {
            setIsLoading(true);
            const studentsData = await fetchStudentsByClasse(classeId);

            if (studentsData.length > 0 && studentsData[0].classe?.libelle) {
                setClasseName(studentsData[0].classe.libelle);
            }

            const results = await Promise.allSettled(
                studentsData.map(async (student) => {
                    const absences = await fetchAbsences(student.id);
                    return { ...student, absences, isResponsable: false };
                })
            );

            const studentsWithAbsences = results
                .filter((r): r is PromiseFulfilledResult<StudentWithAbsences> => r.status === 'fulfilled')
                .map(r => r.value);

            setStudents(studentsWithAbsences);
            setError(null);
        } catch (err) {
            console.error('Error loading students:', err);
            setError('Impossible de charger les étudiants.');
        } finally {
            setIsLoading(false);
        }
    }, [classeId]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleGoBack = () => {
        router.back();
    };

    const handleToggleResponsable = async (studentId: string) => {
        try {
            setUpdatingId(studentId);

            const token = tokenStorage.getAccessToken();
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const url = `${apiUrl}/api/v1/students/${studentId}/responsable`;

            console.log('Calling API:', url);
            console.log('Token present:', !!token);

            if (!token) {
                console.error('Pas de token d\'authentification');
                alert('Veuillez vous reconnecter');
                return;
            }

            // Appeler l'API backend pour basculer le role RESPONSABLE
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response statusText:', response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                // Mettre a jour l'etat local avec la reponse du serveur
                setStudents(prev => prev.map(s =>
                    s.id === studentId ? { ...s, isResponsable: data.data?.isResponsable ?? !s.isResponsable } : s
                ));
            } else {
                const errorText = await response.text();
                console.error('Erreur lors de la mise a jour du responsable:', response.status, errorText);
                alert('Erreur: ' + response.status + ' - ' + errorText);
            }
        } catch (error) {
            console.error('Erreur lors de la mise a jour du responsable:', error);
            alert('Erreur de connexion: ' + error);
        } finally {
            setUpdatingId(null);
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                Chargement des détails de la classe...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
                {error}
                <div style={{ marginTop: '20px' }}>
                    <button
                        onClick={handleGoBack}
                        style={{
                            padding: '10px 20px',
                            background: '#5B8DEF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <button
                    onClick={handleGoBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        background: 'white',
                        cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={20} color="#64748b" />
                </button>
                <div>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#1e293b',
                        margin: 0
                    }}>
                        {classeName || 'Détails de la classe'}
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: '4px 0 0 0'
                    }}>
                        {students.length} étudiant{students.length !== 1 ? 's' : ''} inscrit{students.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Students Table */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                overflow: 'hidden'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                }}>
                    <thead>
                        <tr style={{
                            background: 'linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 100%)'
                        }}>
                            <th style={{
                                padding: '16px',
                                textAlign: 'left',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>N°</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'left',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>Matricule</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'left',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>Nom</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'left',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>Prénom</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>Responsable</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>Total absences</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>Absences justifiées</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>Absences non justifiées</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student.id} style={{
                                background: index % 2 === 0 ? 'white' : '#fafbfc',
                                borderBottom: '1px solid #f1f5f9'
                            }}>
                                <td style={{
                                    padding: '14px 16px',
                                    color: '#64748b',
                                    fontSize: '14px'
                                }}>{index + 1}</td>
                                <td style={{
                                    padding: '14px 16px',
                                    color: '#5B8DEF',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}>{student.matricule}</td>
                                <td style={{
                                    padding: '14px 16px',
                                    color: '#1a202c',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>{student.lastName || '-'}</td>
                                <td style={{
                                    padding: '14px 16px',
                                    color: '#1a202c',
                                    fontSize: '14px'
                                }}>{student.firstName || '-'}</td>
                                <td style={{
                                    padding: '14px 16px',
                                    textAlign: 'center'
                                }}>
                                    <button
                                        onClick={() => handleToggleResponsable(student.id)}
                                        disabled={updatingId === student.id}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            background: student.isResponsable ? '#fbbf24' : '#f1f5f9',
                                            color: student.isResponsable ? '#92400e' : '#64748b',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            opacity: updatingId === student.id ? 0.5 : 1
                                        }}
                                        title={student.isResponsable ? 'Retirer comme responsable' : 'Définir comme responsable'}
                                    >
                                        {updatingId === student.id ? (
                                            <Loader2 size={14} className="animate-spin" style={{ marginRight: '4px' }} />
                                        ) : (
                                            <Star size={14} style={{ marginRight: '4px', fill: student.isResponsable ? '#92400e' : 'none' }} />
                                        )}
                                        {student.isResponsable ? 'Oui' : 'Non'}
                                    </button>
                                </td>
                                <td style={{
                                    padding: '14px 16px',
                                    textAlign: 'center',
                                    color: student.absences.totalAbsences > 0 ? '#dc2626' : '#22c55e',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>{student.absences.totalAbsences}</td>
                                <td style={{
                                    padding: '14px 16px',
                                    textAlign: 'center',
                                    color: '#22c55e',
                                    fontSize: '14px'
                                }}>{student.absences.justifiedAbsences}</td>
                                <td style={{
                                    padding: '14px 16px',
                                    textAlign: 'center',
                                    color: student.absences.unjustifiedAbsences > 0 ? '#dc2626' : '#64748b',
                                    fontSize: '14px',
                                    fontWeight: student.absences.unjustifiedAbsences > 0 ? '600' : '400'
                                }}>{student.absences.unjustifiedAbsences}</td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: '#64748b'
                                }}>
                                    Aucun étudiant trouvé dans cette classe
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
