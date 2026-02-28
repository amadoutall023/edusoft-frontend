'use client';

import React, { useState } from 'react';
import { Calendar, FileText, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { Evaluation, StatutEvaluation, StatutNote } from '../types';

interface EvaluationCardProps {
    evaluation: Evaluation;
    onVoirDetails?: () => void;
    onStatutChange?: (evaluation: Evaluation, newStatut: StatutEvaluation) => void;
    onNoteStatutChange?: (evaluation: Evaluation, newStatut: StatutNote) => void;
}

const statutStyles = {
    'A venir': {
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
        text: 'text-blue-600'
    },
    'Passées': {
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        text: 'text-slate-600'
    }
};

const noteStyles = {
    'A deposer': {
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        text: 'text-amber-600'
    },
    'Note deposees': {
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        text: 'text-emerald-600'
    },
    'Note en retard': {
        badge: 'bg-red-100 text-red-700 border-red-200',
        text: 'text-red-600'
    }
};

export default function EvaluationCard({ evaluation, onVoirDetails, onStatutChange, onNoteStatutChange }: EvaluationCardProps) {
    const [isEditingStatut, setIsEditingStatut] = useState(false);
    const [isEditingNoteStatut, setIsEditingNoteStatut] = useState(false);
    const style = statutStyles[evaluation.statut];
    const noteStyle = noteStyles[evaluation.statutNote];

    const handleStatutChange = (newStatut: StatutEvaluation) => {
        if (onStatutChange) {
            onStatutChange(evaluation, newStatut);
        }
        setIsEditingStatut(false);
    };

    const handleNoteStatutChange = (newStatut: StatutNote) => {
        if (onNoteStatutChange) {
            onNoteStatutChange(evaluation, newStatut);
        }
        setIsEditingNoteStatut(false);
    };

    return (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 
                    hover:shadow-xl hover:border-primary-300 transition-all duration-300">
            {/* Header avec les deux statuts */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {evaluation.titre}
                    </h3>
                    <div className="text-sm text-slate-600 mb-1">
                        {evaluation.classe} - <span className="font-medium">{evaluation.professeur}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                    {/* Select pour le statut (A venir / Passées) */}
                    {isEditingStatut ? (
                        <select
                            value={evaluation.statut}
                            onChange={(e) => handleStatutChange(e.target.value as StatutEvaluation)}
                            onBlur={() => setIsEditingStatut(false)}
                            autoFocus
                            style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                border: '1.5px solid #5B8DEF',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: 'white',
                                color: '#1a202c',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="A venir">A venir</option>
                            <option value="Passées">Passées</option>
                        </select>
                    ) : (
                        <div
                            onClick={() => setIsEditingStatut(true)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border-2 cursor-pointer ${style.badge} hover:opacity-80`}
                            title="Cliquez pour modifier"
                        >
                            {evaluation.statut}
                        </div>
                    )}

                    {/* Select pour le statut des notes (A deposer / Note deposees / Note en retard) */}
                    {isEditingNoteStatut ? (
                        <select
                            value={evaluation.statutNote}
                            onChange={(e) => handleNoteStatutChange(e.target.value as StatutNote)}
                            onBlur={() => setIsEditingNoteStatut(false)}
                            autoFocus
                            style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                border: '1.5px solid #5B8DEF',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: 'white',
                                color: '#1a202c',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="A deposer">A déposer</option>
                            <option value="Note deposees">Note deposées</option>
                            <option value="Note en retard">Note en retard</option>
                        </select>
                    ) : (
                        <div
                            onClick={() => setIsEditingNoteStatut(true)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border-2 cursor-pointer ${noteStyle.badge} hover:opacity-80`}
                            title="Cliquez pour modifier"
                        >
                            {evaluation.statutNote === 'A deposer' ? 'A déposer' : evaluation.statutNote}
                        </div>
                    )}
                </div>
            </div>

            {/* Date de dépôt */}
            <div className="flex items-center gap-2 mb-4 text-sm">
                <Calendar size={18} className="text-blue-500" />
                <span className="text-slate-600">
                    Date de depot des notes : <span className="font-semibold">{evaluation.dateDepot}</span>
                </span>
            </div>

            {/* Fichiers déposés */}
            {evaluation.fichiersDeposes && evaluation.fichiersDeposes.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                        Fichiers déposés: <span className="text-pink-500">{evaluation.fichiersDeposes.length} fichiers</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {evaluation.fichiersDeposes.map((fichier, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 
                                       border border-slate-200 rounded-lg text-xs">
                                <FileText size={14} className="text-slate-500" />
                                <span className="text-slate-700 font-medium">{fichier}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Badges */}
            {evaluation.badges && evaluation.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {evaluation.badges.map((badge, idx) => (
                        <span key={idx} className={`
              px-3 py-1 rounded-full text-xs font-bold
              ${badge.includes('retard') ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}
            `}>
                            {badge}
                        </span>
                    ))}
                </div>
            )}

            {/* Bouton Voir détails */}
            <button
                onClick={onVoirDetails}
                className="w-full px-6 py-3 bg-white border-2 border-slate-200 
                       text-slate-700 rounded-xl font-semibold text-sm
                       hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700
                       transition-all duration-200"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <Eye size={16} />
                Voir details
            </button>
        </div>
    );
}
