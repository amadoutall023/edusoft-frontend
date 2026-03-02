'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, QrCode, CheckCircle, XCircle, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { etudiantActuel } from '@/modules/etudiant/data/etudiants';
import { fetchMyQRCode, registerPresence, QRCodeResponse } from '@/modules/etudiant/services/dashboardService';
import { httpClient } from '@/shared/api/httpClient';
import { ApiResponse, StudentResponseDto } from '@/shared/api/types';
import { mapStudentToEtudiant } from '@/modules/etudiant/data/etudiants';
import { useAuth } from '@/modules/auth/context/AuthContext';

export default function EtudiantScannerPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [qrCode, setQrCode] = useState<QRCodeResponse | null>(null);
    const [etudiant, setEtudiant] = useState(etudiantActuel);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionId, setSessionId] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        loadData();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const studentResponse = await httpClient<ApiResponse<StudentResponseDto | null>>(
                '/api/v1/students/me',
                { suppressErrorLog: true }
            );

            if (studentResponse.data) {
                const mappedEtudiant = mapStudentToEtudiant(studentResponse.data);
                setEtudiant({
                    ...mappedEtudiant,
                    firstName: user?.firstName || mappedEtudiant.firstName,
                    lastName: user?.lastName || mappedEtudiant.lastName
                });
            }

            const qrData = await fetchMyQRCode();
            setQrCode(qrData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartScan = () => {
        setScanning(true);
        setResult(null);

        const sessionIdInput = prompt('Entrez l\'ID de la session (ou laissez vide pour simuler):');

        if (sessionIdInput) {
            setSessionId(sessionIdInput);
        }

        setTimeout(async () => {
            setScanning(false);

            if (sessionIdInput) {
                const response = await registerPresence(
                    sessionIdInput,
                    'DEBUT'
                );
                setResult({
                    success: response.success,
                    message: response.message
                });
            } else {
                const success = Math.random() > 0.3;
                setResult({
                    success,
                    message: success
                        ? 'Presence enregistree avec succes !'
                        : 'Echec de l\'enregistrement. Le code QR a peut-etre expire.'
                });
            }
        }, 2000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#5B8DEF]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.push('/dashboard/etudiant')}
                className="flex items-center gap-2 text-slate-600 hover:text-[#5B8DEF] transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour au dashboard</span>
            </button>

            <div className="bg-gradient-to-r from-[#5B8DEF] to-[#4169B8] rounded-xl md:rounded-[20px] p-6 md:p-8 text-white shadow-lg">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Scanner QR Code
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                    Enregistrez votre presence en scannant le code QR de la salle
                </p>
            </div>

            <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xl font-bold">
                        {etudiant.firstName?.[0] || '?'}{etudiant.lastName?.[0] || ''}
                    </div>
                    <div>
                        <div className="font-semibold text-slate-800">
                            {etudiant.firstName || 'Etudiant'} {etudiant.lastName || ''}
                        </div>
                        <div className="text-sm text-slate-500">{etudiant.classe}</div>
                    </div>
                </div>
            </div>

            {qrCode?.qrCodeImage && (
                <div className="bg-white rounded-xl md:rounded-[20px] p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-slate-100 text-center">
                    <div className="max-w-md mx-auto">
                        {/* Scanner Frame with QR Code inside */}
                        <div className={`relative w-64 h-64 mx-auto mb-4 rounded-2xl overflow-hidden bg-slate-100`}>
                            {qrCode?.qrCodeImage ? (
                                <img
                                    src={qrCode.qrCodeImage}
                                    alt="QR Code personnel"
                                    className="w-full h-full object-contain p-2"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <QrCode className="w-20 h-20 text-slate-400 mb-2" />
                                </div>
                            )}

                            <div className="absolute inset-0 border-4 border-slate-300 rounded-2xl pointer-events-none" />
                        </div>

                        <p className="text-sm text-slate-500">
                            Presentez ce code a votre professeur pour enregistrer votre presence
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-amber-50 rounded-xl p-5 md:p-7 border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">Important</h3>
                <p className="text-sm text-amber-700">
                    Le code QR est valide uniquement pendant la duree du cours.
                    Assurez-vous de scanner votre presence au debut du cours pour eviter toute absence.
                </p>
            </div>
        </div>
    );
}
