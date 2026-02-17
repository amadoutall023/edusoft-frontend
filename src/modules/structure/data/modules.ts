export interface ModuleData {
    id: number;
    nom: string;
    code: string;
    credits?: number;
    filiereId: string;
    classeId?: string;
}

export const modulesData: ModuleData[] = [
    {
        id: 1,
        nom: 'Programmation Web',
        code: 'WEB101',
        credits: 4,
        filiereId: 'INFO',
        classeId: 'Classe A1'
    },
    {
        id: 2,
        nom: 'Base de données',
        code: 'BDD201',
        credits: 3,
        filiereId: 'INFO',
        classeId: 'Classe A1'
    },
    {
        id: 3,
        nom: 'Algorithmique',
        code: 'ALGO101',
        credits: 4,
        filiereId: 'INFO',
        classeId: 'Classe A2'
    },
    {
        id: 4,
        nom: 'Gestion de Projets',
        code: 'GP301',
        credits: 2,
        filiereId: 'GESTION',
        classeId: 'Classe B1'
    },
    {
        id: 5,
        nom: 'Marketing Digital',
        code: 'MKT201',
        credits: 3,
        filiereId: 'MARKETING',
        classeId: 'Classe C1'
    },
    {
        id: 6,
        nom: 'Communication',
        code: 'COM101',
        credits: 2,
        filiereId: 'COMM',
        classeId: 'Classe C2'
    },
];

