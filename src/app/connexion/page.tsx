'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [loginInput, setLoginInput] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const success = login(loginInput);

        if (success) {
            router.push('/dashboard');
        } else {
            setError('Login invalide. Veuillez vérifier vos identifiants.');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Video Background */}
            <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
                <source src="/tt.mp4" type="video/mp4" />
            </video>

            {/* Background pattern */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-[radial-gradient(circle_at_20px_20px,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none z-10" />

            <div className="relative w-[90%] sm:w-[85%] md:w-[80%] lg:w-[420px] p-6 sm:p-8 md:p-10 bg-white rounded-2xl md:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.25)] animation-fade-in z-20">
                {/* Logo/Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] rounded-2xl md:rounded-[16px] bg-gradient-to-br from-[#5B8DEF] to-[#4169B8] flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
                        <Lock size={24} className="sm:text-2xl md:text-[32px]" color="white" strokeWidth={2} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1a202c] mb-1 md:mb-2">
                        EduSoft
                    </h1>
                    <p className="text-xs sm:text-sm text-[#64748b]">
                        Connectez-vous pour accéder au tableau de bord
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 md:p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl mb-4 md:mb-5 text-xs sm:text-sm text-[#DC2626]">
                        <AlertCircle size={16} className="sm:size-[18px]" />
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-5 md:mb-6">
                        <label className="block text-sm font-semibold text-[#1a202c] mb-2">
                            Login
                        </label>
                        <input
                            type="text"
                            value={loginInput}
                            onChange={(e) => setLoginInput(e.target.value)}
                            placeholder="Entrez votre login"
                            required
                            className="w-full px-3 py-3 sm:px-4 sm:py-[14px] rounded-xl border border-gray-200 text-sm sm:text-base outline-none transition-all duration-200 font-inherit bg-[#f8fafc] focus:border-[#5B8DEF] focus:bg-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 sm:py-[14px] px-4 sm:px-6 rounded-xl border-none text-white text-sm sm:text-base font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${isSubmitting
                            ? 'bg-gray-400'
                            : 'bg-gradient-to-br from-[#5B8DEF] to-[#4169B8] shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 sm:w-[18px] sm:h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Connexion...
                            </>
                        ) : (
                            <>
                                <LogIn size={16} className="sm:size-[18px]" />
                                Se connecter
                            </>
                        )}
                    </button>
                </form>

                {/* Demo credentials hint */}
                <div className="mt-6 md:mt-7 p-3 md:p-4 bg-[#f8fafc] rounded-xl text-center overflow-x-auto">
                    <p className="text-xs text-[#64748b] mb-2">
                        Logins disponibles pour test:
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5 min-w-max">
                        {['Diarra123p', 'Astouacp', 'Lucien23op', 'Mar998M', 'Kande783O'].map(cred => (
                            <span key={cred} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] sm:text-xs text-[#475569] font-mono whitespace-nowrap">
                                {cred}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animation-fade-in {
                    animation: fadeIn 0.5s ease;
                }
            `}</style>
        </div>
    );
}
