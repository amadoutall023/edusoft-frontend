'use client';

import React, { useState, useMemo } from 'react';

interface CoursHeure {
    id: string;
    cours: string;
    classe: string;
    heuresPrevues: number;
    heuresFaites: number;
}

interface CoursHeuresCardProps {
    cours: CoursHeure[];
}

export default function CoursHeuresCard({ cours }: CoursHeuresCardProps) {
    const [classeSelectionnee, setClasseSelectionnee] = useState<string>('toutes');

    // Extraire les classes uniques
    const classes = useMemo(() => {
        const uniqueClasses = [...new Set(cours.map(c => c.classe))];
        return ['toutes', ...uniqueClasses];
    }, [cours]);

    // Filtrer les cours par classe
    const coursFiltres = useMemo(() => {
        if (classeSelectionnee === 'toutes') {
            return cours;
        }
        return cours.filter(c => c.classe === classeSelectionnee);
    }, [cours, classeSelectionnee]);

    // Trouver le maximum pour l'échelle
    const maxHeure = Math.max(
        ...coursFiltres.map(c => Math.max(c.heuresPrevues, c.heuresFaites)),
        1
    );

    // Calculer les totaux
    const totalPrevues = coursFiltres.reduce((acc, c) => acc + c.heuresPrevues, 0);
    const totalFaites = coursFiltres.reduce((acc, c) => acc + c.heuresFaites, 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">
                    Heures de cours
                </h3>

                {/* Filtre par classe */}
                <select
                    value={classeSelectionnee}
                    onChange={(e) => setClasseSelectionnee(e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {classes.map((classe) => (
                        <option key={classe} value={classe}>
                            {classe === 'toutes' ? 'Toutes les classes' : classe}
                        </option>
                    ))}
                </select>
            </div>

            {/* Résumé */}
            <div className="flex items-center justify-between mb-6 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm text-slate-600">Programmées</span>
                    <span className="font-semibold text-slate-800">{totalPrevues}h</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-sm text-slate-600">Faites</span>
                    <span className="font-semibold text-slate-800">{totalFaites}h</span>
                </div>
            </div>

            {/* Graphique en barres */}
            <div className="space-y-4">
                {coursFiltres.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                        Aucune donnée disponible
                    </p>
                ) : (
                    coursFiltres.map((item) => {
                        const hauteurPrevues = (item.heuresPrevues / maxHeure) * 100;
                        const hauteurFaites = (item.heuresFaites / maxHeure) * 100;

                        return (
                            <div key={item.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700 truncate max-w-[150px]" title={item.cours}>
                                        {item.cours}
                                    </span>
                                    <span className="text-slate-500 text-xs">
                                        {item.classe}
                                    </span>
                                </div>
                                <div className="relative h-8 flex items-end gap-1">
                                    {/* Barre heures programmées */}
                                    <div
                                        className="w-1/2 bg-blue-500 rounded-l relative group"
                                        style={{ height: `${hauteurPrevues}%` }}
                                        title={`Programmées: ${item.heuresPrevues}h`}
                                    >
                                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium text-blue-600 whitespace-nowrap">
                                            {item.heuresPrevues}h
                                        </span>
                                    </div>
                                    {/* Barre heures faites */}
                                    <div
                                        className="w-1/2 bg-emerald-500 rounded-r relative group"
                                        style={{ height: `${hauteurFaites}%` }}
                                        title={`Faites: ${item.heuresFaites}h`}
                                    >
                                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium text-emerald-600 whitespace-nowrap">
                                            {item.heuresFaites}h
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Légende */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                    <span className="text-sm text-slate-600">Heures programmées</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded" />
                    <span className="text-sm text-slate-600">Heures effectuées</span>
                </div>
            </div>
        </div>
    );
}
