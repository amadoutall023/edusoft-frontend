'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { fetchStudentsByClasse, fetchClasseAbsenceStats, AbsenceStats } from '@/modules/etudiant/services/studentService';
import { StudentResponseDto } from '@/shared/api/types';
import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse } from '@/shared/api/types';

interface PresenceStats {
    totalAbsences: number;
    justifiedAbsences: number;
    unjustifiedAbsences: number;
}

interface StudentWithAbsences extends StudentResponseDto {
    absences: PresenceStats;
}

export default function ClasseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const classeId = params.id as string;

    const [students, setStudents] = useState<StudentWithAbsences[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [classeName, setClasseName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchAbsences = async (studentId: string): Promise<PresenceStats> => {
        try {
            const response = await fetchClasseAbsenceStats(classeId);
            // Find the stats for this specific student
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
        // Fallback to zeros if API fails
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

            // Get class name from first student if available
            if (studentsData.length > 0 && studentsData[0].classe?.libelle) {
                setClasseName(studentsData[0].classe.libelle);
            }

            // Fetch absences for each student (use Promise.allSettled to continue even if one fails)
            const results = await Promise.allSettled(
                studentsData.map(async (student) => {
                    const absences = await fetchAbsences(student.id);
                    return { ...student, absences };
                })
            );

            // Process results
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
                                <td colSpan={7} style={{
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
