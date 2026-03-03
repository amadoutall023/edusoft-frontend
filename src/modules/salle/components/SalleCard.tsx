'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Users, MapPin, BookOpen, GraduationCap } from 'lucide-react';
import { Salle, PlanningSlot } from './types';
import Swal from 'sweetalert2';

interface SalleCardProps {
    salle: Salle;
}

export default function SalleCard({ salle }: SalleCardProps) {
    const isLibre = salle.statut === 'Libre';
    const [showModal, setShowModal] = useState(false);
    const [showPlanningModal, setShowPlanningModal] = useState(false);
    const [reservation, setReservation] = useState({
        date: '',
        heureDebut: '',
        heureFin: '',
        motif: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Données d'exemple pour l'emploi du temps - à remplacer par un appel API
    const emploiDuTemps: PlanningSlot[] = salle.emploiDuTemps || [
        { id: 1, heureDebut: '08:00', heureFin: '10:00', cours: 'Algorithmique', classe: 'L1 CPD', professeur: 'Prof. Mr Niang', estLibre: false },
        { id: 2, heureDebut: '10:00', heureFin: '12:00', cours: 'Base de données', classe: 'L2 CDSD', professeur: 'Prof. Mme Diallo', estLibre: false },
        { id: 3, heureDebut: '12:00', heureFin: '14:00', cours: '', classe: '', professeur: '', estLibre: true },
        { id: 4, heureDebut: '14:00', heureFin: '16:00', cours: 'Web Development', classe: 'L3 CPD', professeur: 'Prof. Mr Sall', estLibre: false },
        { id: 5, heureDebut: '16:00', heureFin: '18:00', cours: 'Python Avancé', classe: 'L2 CPD', professeur: 'Prof. Mr Kane', estLibre: false },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulation d'envoi - à remplacer par un appel API
        console.log('Réservation:', {
            salle: salle.numero,
            capacite: salle.capacite,
            ...reservation
        });

        // Fermer le modal après soumission
        setTimeout(() => {
            setShowModal(false);
            setReservation({ date: '', heureDebut: '', heureFin: '', motif: '' });
            setIsSubmitting(false);
            Swal.fire({
                title: 'Succès !',
                text: 'Réservation enregistrée avec succès!',
                icon: 'success'
            });
        }, 1000);
    };

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setReservation({ date: '', heureDebut: '', heureFin: '', motif: '' });
    };

    return (
        <>
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 
                        hover:shadow-xl hover:border-primary-300 transition-all duration-300">
                {/* Header avec numéro et statut */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">
                            Salle {salle.numero}
                        </h3>
                        <div className="text-sm text-slate-500 font-medium">
                            {salle.etage}
                        </div>
                    </div>
                    <div className={`
          px-4 py-1.5 rounded-full text-sm font-bold
          ${isLibre
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }
        `}>
                        {salle.statut}
                    </div>
                </div>

                {/* Capacité */}
                <div className="mb-4 pb-4 border-b border-slate-200">
                    <div className="text-sm text-slate-600">
                        Capacite: <span className="font-bold text-slate-900">{salle.capacite} place</span>
                    </div>
                </div>

                {/* Information d'occupation ou de disponibilité */}
                {salle.statut === 'Occupee' && salle.ocupationActuelle ? (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="text-xs font-bold text-red-700 mb-2">
                            Salle occuper a cet instant
                        </div>
                        <div className="text-sm text-red-800 font-semibold mb-1">
                            {salle.ocupationActuelle.cours}
                        </div>
                        <div className="text-xs text-red-700">
                            {salle.ocupationActuelle.professeur}
                        </div>
                    </div>
                ) : salle.prochaineCourse ? (
                    <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="text-xs font-bold text-emerald-700 mb-1">
                            Salle libre a cet instant
                        </div>
                        <div className="text-sm text-emerald-800 font-semibold">
                            Sera occuper a partir de {salle.prochaineCourse.heure}
                        </div>
                    </div>
                ) : null}

                {/* Boutons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowPlanningModal(true)}
                        className="flex-1 px-4 py-2.5 bg-white border-2 border-slate-200 
                                 text-slate-700 rounded-xl font-semibold text-sm
                                 hover:border-slate-300 hover:bg-slate-50 transition-all"
                    >
                        Planning
                    </button>
                    <button
                        onClick={openModal}
                        className="flex-1 px-4 py-2.5 bg-white border-2 border-primary-500 
                             text-slate-900 rounded-xl font-semibold text-sm
                             hover:bg-primary-50 transition-all shadow-md hover:shadow-lg">
                        Reserver
                    </button>
                </div>
            </div>

            {/* Modal de réservation */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={closeModal}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '32px',
                            width: '90%',
                            maxWidth: '500px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            animation: 'slideIn 0.3s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: '700',
                                color: '#1a202c',
                                margin: 0
                            }}>Réserver la salle {salle.numero}</h2>
                            <button
                                onClick={closeModal}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: '#f1f5f9',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        {/* Informations de la salle (pré-remplies) */}
                        <div style={{
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '24px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <MapPin size={18} color="#5B8DEF" />
                                <span style={{ fontWeight: '600', color: '#1a202c' }}>
                                    Salle {salle.numero}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Users size={18} color="#5B8DEF" />
                                <span style={{ fontWeight: '600', color: '#1a202c' }}>
                                    Capacité: {salle.capacite} places
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Date */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>
                                    <Calendar size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={reservation.date}
                                    onChange={(e) => setReservation({ ...reservation, date: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            {/* Heure de début */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>
                                    <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                    Heure de début
                                </label>
                                <input
                                    type="time"
                                    value={reservation.heureDebut}
                                    onChange={(e) => setReservation({ ...reservation, heureDebut: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            {/* Heure de fin */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>
                                    <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                    Heure de fin
                                </label>
                                <input
                                    type="time"
                                    value={reservation.heureFin}
                                    onChange={(e) => setReservation({ ...reservation, heureFin: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            {/* Motif */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>
                                    Motif de la réservation
                                </label>
                                <textarea
                                    value={reservation.motif}
                                    onChange={(e) => setReservation({ ...reservation, motif: e.target.value })}
                                    placeholder="Ex: Cours de TD, Examen, Réunion..."
                                    required
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        fontFamily: 'inherit',
                                        resize: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        background: 'white',
                                        color: '#64748b',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #5B8DEF 0%, #4169B8 100%)',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 12px rgba(91,141,239,0.3)',
                                        opacity: isSubmitting ? 0.7 : 1
                                    }}
                                >
                                    {isSubmitting ? 'Réservation...' : 'Confirmer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal d'emploi du temps / Planning */}
            {showPlanningModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setShowPlanningModal(false)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '32px',
                            width: '90%',
                            maxWidth: '600px',
                            maxHeight: '85vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            animation: 'slideIn 0.3s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <div>
                                <h2 style={{
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    color: '#1a202c',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <Calendar size={24} color="#5B8DEF" />
                                    Emploi du temps - Salle {salle.numero}
                                </h2>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#64748b',
                                    marginTop: '4px'
                                }}>
                                    {salle.etage} • {salle.capacite} places
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPlanningModal(false)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: '#f1f5f9',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        {/* Liste des créneaux horaires */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {emploiDuTemps.map((slot) => (
                                <div
                                    key={slot.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: slot.estLibre ? '#f0fdf4' : '#f8fafc',
                                        border: `2px solid ${slot.estLibre ? '#22c55e' : '#e2e8f0'}`,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {/*Heure */}
                                    <div style={{
                                        minWidth: '80px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <Clock size={16} color={slot.estLibre ? '#22c55e' : '#64748b'} />
                                        <span style={{
                                            fontWeight: '700',
                                            fontSize: '14px',
                                            color: slot.estLibre ? '#22c55e' : '#1a202c'
                                        }}>
                                            {slot.heureDebut}-{slot.heureFin}
                                        </span>
                                    </div>

                                    {/* Séparateur */}
                                    <div style={{
                                        width: '2px',
                                        height: '40px',
                                        background: slot.estLibre ? '#22c55e' : '#e2e8f0',
                                        borderRadius: '1px'
                                    }} />

                                    {/* Contenu */}
                                    {slot.estLibre ? (
                                        <div style={{ flex: 1 }}>
                                            <span style={{
                                                fontWeight: '600',
                                                color: '#22c55e',
                                                fontSize: '14px'
                                            }}>
                                                Disponible
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <BookOpen size={14} color="#5B8DEF" />
                                                <span style={{ fontWeight: '600', color: '#1a202c', fontSize: '14px' }}>
                                                    {slot.cours}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <GraduationCap size={14} color="#64748b" />
                                                <span style={{ color: '#64748b', fontSize: '13px' }}>
                                                    {slot.classe}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Users size={14} color="#64748b" />
                                                <span style={{ color: '#64748b', fontSize: '13px' }}>
                                                    {slot.professeur}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Bouton fermer */}
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowPlanningModal(false)}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    background: 'white',
                                    color: '#64748b',
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
            )
            }
        </>
    );
}

