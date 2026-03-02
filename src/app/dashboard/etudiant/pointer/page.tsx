'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, CheckCircle, XCircle, ArrowLeft, Loader2, Search, User, BookOpen, Camera, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, StudentResponseDto, UUID } from '@/shared/api/types';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { mettreAJourPresenceEtudiant, getPresencesEtudiantsByType, HemargeType, PresenceStatus } from '@/modules/cours/services/presenceService';
import { Html5Qrcode } from 'html5-qrcode';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    matricule: string;
    qrToken?: string;
    status: 'pending' | 'present' | 'absent' | 'excused';
}

interface Session {
    id: string;
    libelle: string;
    date: string;
    startHour: string;
    endHour: string;
    moduleLibelle: string;
    salleLibelle?: string;
}

interface Classe {
    id: string;
    libelle: string;
    filiereLabel?: string;
    niveauLabel?: string;
}

export default function PointerPage() {
    const router = useRouter();
    const { user, roles } = useAuth();
    const isResponsable = roles.includes('ROLE_RESPONSABLE');

    const [isLoading, setIsLoading] = useState(true);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [step, setStep] = useState<'classe' | 'session' | 'students'>('classe');
    const [pointingMode, setPointingMode] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // Modal de scan QR
    const [showScanModal, setShowScanModal] = useState(false);
    const [scanningStudent, setScanningStudent] = useState<Student | null>(null);
    const [scanError, setScanError] = useState('');
    const [scanSuccess, setScanSuccess] = useState(false);
    const qrScannerRef = useRef<Html5Qrcode | null>(null);
    const scannerMountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadClasses();
    }, []);

    // Cleanup QR scanner on unmount
    useEffect(() => {
        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const loadClasses = async () => {
        try {
            setIsLoading(true);
            setLoadingMessage('Chargement de votre classe...');

            const studentResponse = await httpClient<ApiResponse<StudentResponseDto | null>>(
                '/api/v1/students/me',
                { suppressErrorLog: true }
            );

            if (studentResponse.data && studentResponse.data.classe?.id) {
                const classeData: Classe = {
                    id: studentResponse.data.classe.id,
                    libelle: studentResponse.data.classe.libelle || 'Ma Classe',
                    filiereLabel: studentResponse.data.classe.filiere?.libelle || undefined,
                    niveauLabel: studentResponse.data.classe.niveau?.libelle || undefined
                };
                setClasses([classeData]);
                setSelectedClasse(classeData);
                await loadSessionsAndStudents(classeData.id);
            } else {
                setClasses([]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la classe:', error);
            setClasses([]);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const loadSessionsAndStudents = async (classeId: string) => {
        try {
            setIsLoading(true);
            setLoadingMessage('Chargement des sessions et étudiants...');

            const today = new Date().toISOString().split('T')[0];
            const sessionsResponse = await httpClient<ApiResponse<any>>(
                `/api/v1/sessions?classeId=${classeId}&date=${today}&size=50`,
                { suppressErrorLog: true }
            );

            const sessionsData = sessionsResponse.data?.content || sessionsResponse.data || [];
            const mappedSessions: Session[] = sessionsData.map((s: any) => ({
                id: s.id,
                libelle: s.libelle || s.cours?.libelle || s.module?.libelle || 'Cours',
                date: s.date,
                startHour: s.startHour,
                endHour: s.endHour,
                moduleLibelle: s.module?.libelle || s.cours?.module?.libelle || '',
                salleLibelle: s.salle?.libelle || ''
            }));

            setSessions(mappedSessions);

            // Charger les étudiants de la classe avec leur qrToken
            const studentsResponse = await httpClient<ApiResponse<any>>(
                `/api/v1/students/classe/${classeId}`,
                { suppressErrorLog: true }
            );

            const studentsData = studentsResponse.data || [];
            const mappedStudents: Student[] = studentsData.map((s: any) => ({
                id: s.id,
                firstName: s.firstName || '',
                lastName: s.lastName || '',
                matricule: s.matricule || '',
                qrToken: s.qrToken,
                status: 'pending' as const
            }));

            setStudents(mappedStudents);

            if (mappedSessions.length === 0) {
                setStep('students');
            } else {
                setStep('session');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleSessionSelect = async (session: Session) => {
        setSelectedSession(session);
        
        // Charger les présences existantes pour cette session
        try {
            const presences = await getPresencesEtudiantsByType(session.id, 'DEBUT');
            
            // Mettre à jour le statut des étudiants en fonction des présences
            setStudents(prev => prev.map(student => {
                const presence = presences.find(p => p.studentId === student.id);
                if (presence) {
                    return { 
                        ...student, 
                        status: presence.status === 'PRESENT' ? 'present' as const : 
                               presence.status === 'EXCUSE' ? 'excused' as const : 
                               'absent' as const
                    };
                }
                return { ...student, status: 'pending' as const };
            }));
        } catch (error) {
            console.error('Erreur lors du chargement des présences:', error);
        }
        
        setStep('students');
    };

    // Démarrer le scan QR pour un étudiant spécifique
    const handleStudentClick = (student: Student) => {
        if (!selectedSession) {
            alert('Veuillez sélectionner une session (cours) avant de pointer les étudiants.');
            return;
        }

        if (student.status === 'present') {
            return;
        }

        setScanningStudent(student);
        setShowScanModal(true);
        setScanError('');
        setScanSuccess(false);
    };

    // Démarrer le scanner QR
    const startQRScanner = async () => {
        if (!scannerMountRef.current) return;

        try {
            const scanner = new Html5Qrcode('qr-scanner-mount');
            qrScannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    // QR code scanné avec succès
                    handleQRScan(decodedText);
                },
                () => { }
            );
        } catch (error) {
            console.error('Erreur caméra:', error);
            setScanError('Impossible de démarrer la caméra. Veuillez autoriser l\'accès.');
        }
    };

    // Arrêter le scanner QR
    const stopQRScanner = async () => {
        if (qrScannerRef.current) {
            try {
                await qrScannerRef.current.stop();
            } catch (e) { }
            qrScannerRef.current = null;
        }
    };

    // Gérer le scan du QR code
    const handleQRScan = async (qrData: string) => {
        if (!scanningStudent || !selectedSession) return;

        // Le QR code contient le qrToken de l'étudiant
        // Vérifier que c'est le bon étudiant
        if (scanningStudent.qrToken && qrData.includes(scanningStudent.qrToken)) {
            // QR code valide - marquer comme présent
            await markStudentPresent(scanningStudent);
            setScanSuccess(true);
            setTimeout(() => {
                closeScanModal();
            }, 1500);
        } else {
            setScanError('QR code invalide. Veuillez scanner le code de l\'étudiant.');
        }
    };

    // Marquer l'étudiant comme présent
    const markStudentPresent = async (student: Student) => {
        if (!selectedSession) return;

        try {
            // Mettre à jour l'état local
            setStudents(prev => prev.map(s =>
                s.id === student.id ? { ...s, status: 'present' as const } : s
            ));

            // Appeler l'API pour enregistrer la présence
            await mettreAJourPresenceEtudiant(
                selectedSession.id,
                student.id,
                'DEBUT' as HemargeType,
                'PRESENT' as PresenceStatus
            );
        } catch (error) {
            console.error('Erreur lors du pointage:', error);
            // Revenir en cas d'erreur
            setStudents(prev => prev.map(s =>
                s.id === student.id ? { ...s, status: 'pending' as const } : s
            ));
            throw error;
        }
    };

    // Fermer le modal de scan
    const closeScanModal = async () => {
        await stopQRScanner();
        setShowScanModal(false);
        setScanningStudent(null);
        setScanError('');
        setScanSuccess(false);
    };

    // Marquer tous les étudiants comme présents (sans scan QR)
    const handleMarkAllPresent = async () => {
        if (!selectedSession) {
            alert('Veuillez sélectionner une session (cours) avant de pointer les étudiants.');
            return;
        }

        try {
            setPointingMode(true);

            const allPresent = students.map(s => ({ ...s, status: 'present' as const }));
            setStudents(allPresent);

            for (const student of students) {
                if (student.status !== 'present') {
                    try {
                        await mettreAJourPresenceEtudiant(
                            selectedSession.id,
                            student.id,
                            'DEBUT' as HemargeType,
                            'PRESENT' as PresenceStatus
                        );
                    } catch (e) {
                        console.error(`Erreur pour ${student.firstName}:`, e);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur lors du pointage de tous les étudiants:', error);
        } finally {
            setPointingMode(false);
        }
    };

    // Effet pour démarrer/arrêter le scanner
    useEffect(() => {
        if (showScanModal) {
            startQRScanner();
        } else {
            stopQRScanner();
        }
    }, [showScanModal]);

    const presentCount = students.filter(s => s.status === 'present').length;
    const pendingCount = students.filter(s => s.status === 'pending').length;

    const filteredStudents = searchQuery.trim() === ''
        ? students
        : students.filter(
            s =>
                s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.matricule.toLowerCase().includes(searchQuery.toLowerCase())
        );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#5B8DEF]" />
                <p className="text-slate-500">{loadingMessage || 'Chargement...'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Bouton retour */}
            <button
                onClick={() => router.push('/dashboard/etudiant')}
                className="flex items-center gap-2 text-slate-600 hover:text-[#5B8DEF] transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour au dashboard</span>
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#10b981] to-[#059669] rounded-xl md:rounded-[20px] p-6 md:p-8 text-white shadow-lg">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {isResponsable ? 'Pointer les Étudiants' : 'Mon Pointage'}
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                    {isResponsable
                        ? 'Cliquez sur un étudiant pour scanner son QR code et le pointer'
                        : 'Scannez votre code ou cliquez sur votre nom pour marquer votre présence'}
                </p>
            </div>

            {/* Step 2: Sélection de la session */}
            {((isResponsable && step === 'session') || (!isResponsable && step === 'session')) && sessions.length > 0 && (
                <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Sélectionner une Session (Cours du jour)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sessions.map(session => (
                            <button
                                key={session.id}
                                onClick={() => handleSessionSelect(session)}
                                className={`p-4 border rounded-xl transition-all text-left ${selectedSession?.id === session.id
                                        ? 'border-[#10b981] bg-[#10b981]/5'
                                        : 'border-slate-200 hover:border-[#10b981] hover:bg-[#10b981]/5'
                                    }`}
                            >
                                <div className="font-medium text-slate-800">{session.libelle}</div>
                                <div className="text-sm text-slate-500">{session.moduleLibelle}</div>
                                <div className="text-sm text-slate-400 mt-1">
                                    {session.startHour} - {session.endHour}
                                    {session.salleLibelle && ` • ${session.salleLibelle}`}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Liste des étudiants */}
            {((isResponsable && step === 'students') || (!isResponsable && (step === 'students' || sessions.length === 0))) && (
                <>
                    <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Liste des Étudiants ({filteredStudents.length})
                                </h2>
                                {selectedClasse && (
                                    <p className="text-sm text-slate-500">{selectedClasse.libelle}</p>
                                )}
                            </div>

                            {isResponsable && selectedSession && (
                                <button
                                    onClick={handleMarkAllPresent}
                                    disabled={pointingMode}
                                    className="px-4 py-2 bg-[#10b981] text-white font-medium rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {pointingMode ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    Tous marquer présents
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                                <div className="text-xs text-green-700">Présents</div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-slate-600">{pendingCount}</div>
                                <div className="text-xs text-slate-700">En attente</div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un étudiant par nom ou matricule..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                            />
                        </div>

                        {/* Students List */}
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {filteredStudents.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    Aucun étudiant trouvé
                                </div>
                            ) : (
                                filteredStudents.map(student => (
                                    <div
                                        key={student.id}
                                        onClick={() => isResponsable && handleStudentClick(student)}
                                        className={`flex items-center justify-between p-4 border rounded-xl transition-colors cursor-pointer ${student.status === 'present'
                                                ? 'border-green-200 bg-green-50'
                                                : isResponsable
                                                    ? 'border-slate-100 hover:border-[#10b981] hover:bg-[#10b981]/5'
                                                    : 'border-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${student.status === 'present'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-800">
                                                    {student.firstName} {student.lastName}
                                                </div>
                                                <div className="text-sm text-slate-500">Mat: {student.matricule}</div>
                                            </div>
                                        </div>

                                        {isResponsable ? (
                                            <div className={`p-2 rounded-lg ${student.status === 'present'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {student.status === 'present' ? (
                                                    <CheckCircle className="w-6 h-6" />
                                                ) : (
                                                    <Camera className="w-6 h-6" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className={`text-sm font-medium ${student.status === 'present'
                                                    ? 'text-green-600'
                                                    : 'text-slate-400'
                                                }`}>
                                                {student.status === 'present' ? 'Présent' : 'En attente'}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Modal de scan QR */}
            {showScanModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
                        <button
                            onClick={closeScanModal}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Camera className="w-5 h-5" />
                            Scanner QR Code
                        </h3>

                        {scanningStudent && (
                            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600">Étudiant:</p>
                                <p className="font-medium">{scanningStudent.firstName} {scanningStudent.lastName}</p>
                                <p className="text-sm text-slate-500">Mat: {scanningStudent.matricule}</p>
                            </div>
                        )}

                        {scanSuccess ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <p className="text-lg font-medium text-green-600">Présence enregistrée!</p>
                            </div>
                        ) : (
                            <>
                                <div
                                    id="qr-scanner-mount"
                                    ref={scannerMountRef}
                                    className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden mb-4"
                                ></div>

                                {scanError && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
                                        {scanError}
                                    </div>
                                )}

                                <p className="text-sm text-slate-500 text-center">
                                    Scannez le QR code de l'étudiant pour confirmer sa présence
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
